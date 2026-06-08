import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LabelSurface } from '../src/components/LabelView';
import { Banner, Button, Chip, IconButton, ScrollView, SegmentedControl, Stepper, Txt } from '../src/components/ui';
import { Bitmap, rotateBitmap } from '../src/lib/niimbot/encoder';
import { bitmapToPngDataUri, captureBitmap, RasterLabel } from '../src/lib/raster';
import { sizeLabel } from '../src/lib/util';
import { usePrinter } from '../src/store/printer';
import { useSession } from '../src/store/session';
import { useSettings } from '../src/store/settings';
import { useToast } from '../src/store/toast';
import { useTheme } from '../src/theme/ThemeProvider';

type Rotation = 0 | 90 | 180 | 270;

export default function PreviewScreen() {
  const t = useTheme();
  const router = useRouter();
  const preview = useSession((s) => s.preview);
  const settings = useSettings();
  const printer = usePrinter();
  const showToast = useToast((s) => s.show);

  const rasterRef = useRef<View>(null);
  const [mode, setMode] = useState<'design' | 'print'>('print');
  const [density, setDensity] = useState(settings.defaultDensity);
  const [quantity, setQuantity] = useState(settings.defaultQuantity);
  const [rotation, setRotation] = useState<Rotation>(0);
  const [base, setBase] = useState<Bitmap | null>(null);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const design = preview?.design ?? null;

  // Capture the off-screen label once it has laid out.
  useEffect(() => {
    if (!design) return;
    let active = true;
    const id = setTimeout(async () => {
      try {
        const bmp = await captureBitmap(rasterRef, design, 'threshold');
        if (active) setBase(bmp);
      } catch (e: any) {
        if (active) setError(e?.message ?? 'Could not render the label.');
      }
    }, 120);
    return () => {
      active = false;
      clearTimeout(id);
    };
  }, [design]);

  // Re-derive the rotated bitmap + preview image whenever rotation or base changes.
  const rotated = base ? rotateBitmap(base, rotation) : null;
  useEffect(() => {
    if (!rotated) return;
    try {
      setPreviewUri(bitmapToPngDataUri(rotated));
    } catch {
      /* ignore preview render errors */
    }
  }, [base, rotation]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!design) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: t.colors.bg }}>
        <Txt>Nothing to preview.</Txt>
        <Button variant="ghost" onPress={() => router.back()}>
          Close
        </Button>
      </SafeAreaView>
    );
  }

  const connected = printer.connection === 'connected';
  const detected = printer.detected;
  const mismatch = detected && (detected.widthMm !== design.widthMm || detected.heightMm !== design.heightMm);
  const lidOpen = printer.status.doorOpen === true;
  const noPaper = printer.status.paperPresent === false;
  const printing = printer.printing;
  const busy = !!printing;

  let blockReason: string | null = null;
  if (!connected) blockReason = 'Connect a printer to print';
  else if (lidOpen) blockReason = 'Close the printer lid to print';
  else if (noPaper) blockReason = 'Load paper to print';
  else if (!rotated) blockReason = 'Rendering…';

  // Display sizing (fit within ~250pt wide).
  const dispW = rotation === 90 || rotation === 270 ? design.heightMm : design.widthMm;
  const dispH = rotation === 90 || rotation === 270 ? design.widthMm : design.heightMm;
  const dscale = Math.min(250 / dispW, 170 / dispH, 8);

  const doPrint = async () => {
    if (!rotated) return;
    try {
      await printer.print(rotated, { density, quantity });
      showToast(`Printed ${quantity}× ${sizeLabel(design.widthMm, design.heightMm)}`);
      router.back();
    } catch (e: any) {
      setError(e?.message ?? 'Print failed.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.bg }}>
      {/* Capture source: rendered on-screen (so its children paint into the view-shot
          snapshot) then hidden behind the opaque overlay below. */}
      <RasterLabel design={design} innerRef={rasterRef} />
      <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: t.colors.bg }} />

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: t.spacing.lg }}>
        <Txt variant="title">Preview</Txt>
        <IconButton icon="x" onPress={() => router.back()} disabled={busy} accessibilityLabel="Close" />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: t.spacing.lg, paddingBottom: t.spacing.xxl }}>
        <SegmentedControl
          options={[
            { value: 'design', label: 'Design' },
            { value: 'print', label: 'Print output' },
          ]}
          value={mode}
          onChange={setMode}
          style={{ marginBottom: 16 }}
        />

        <View style={{ alignItems: 'center', justifyContent: 'center', minHeight: dispH * dscale + 24, paddingVertical: 12 }}>
          {mode === 'design' ? (
            <View style={{ transform: [{ rotate: `${rotation}deg` }], ...t.shadow('pop') }}>
              <LabelSurface design={design} pxPerMm={dscale} />
            </View>
          ) : previewUri ? (
            <Image
              source={{ uri: previewUri }}
              style={{ width: dispW * dscale, height: dispH * dscale, resizeMode: 'contain', ...t.shadow('pop') }}
            />
          ) : (
            <ActivityIndicator color={t.colors.primary} />
          )}
        </View>

        {mismatch && (
          <Banner variant="warning" icon="warning" title="Size mismatch">
            <Txt variant="caption" color={t.colors.textMuted}>
              Design is {sizeLabel(design.widthMm, design.heightMm)} but a{' '}
              {sizeLabel(detected!.widthMm, detected!.heightMm)} label is loaded.
            </Txt>
          </Banner>
        )}

        {error && (
          <Banner variant="danger" icon="warning" title="Something went wrong">
            <Txt variant="caption" color={t.colors.textMuted}>
              {error}
            </Txt>
          </Banner>
        )}

        {busy ? (
          <View style={{ marginTop: 20, gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Txt variant="bodyStrong">{printing!.phase === 'finishing' ? 'Finishing…' : printing!.phase === 'done' ? 'Done' : 'Printing…'}</Txt>
              <Txt variant="mono" color={t.colors.textMuted}>
                {Math.round(printing!.percent)}%
              </Txt>
            </View>
            <View style={{ height: 8, borderRadius: 4, backgroundColor: t.colors.surfaceAlt, overflow: 'hidden' }}>
              <View style={{ height: '100%', width: `${printing!.percent}%`, backgroundColor: t.colors.primary }} />
            </View>
          </View>
        ) : (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18 }}>
              <Txt variant="bodyStrong">Density</Txt>
              <Stepper value={density} min={1} max={5} onChange={setDensity} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
              <Txt variant="bodyStrong">Quantity</Txt>
              <Stepper value={quantity} min={1} max={99} onChange={setQuantity} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
              <Txt variant="bodyStrong">Rotate</Txt>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {([0, 90, 180, 270] as Rotation[]).map((r) => (
                  <Chip key={r} selected={rotation === r} onPress={() => setRotation(r)}>
                    {r}°
                  </Chip>
                ))}
              </View>
            </View>

            <Button
              variant="primary"
              fullWidth
              icon={connected ? 'printer' : 'bluetooth-off'}
              style={{ marginTop: 20 }}
              disabled={!!blockReason}
              onPress={doPrint}
            >
              {blockReason ?? `Print ${quantity > 1 ? `${quantity}×` : ''}`}
            </Button>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
