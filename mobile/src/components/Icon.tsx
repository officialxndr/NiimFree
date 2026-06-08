import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { useTheme } from '../theme/ThemeProvider';

// Semantic icon names used across the app, mapped to a concrete vector-icon. Keeping the
// indirection means screens reference intent ("printer", "bluetooth") not a specific set.
type IconSet = 'ion' | 'mci';
const MAP: Record<string, [IconSet, string]> = {
  tags: ['mci', 'tag-multiple-outline'],
  tag: ['ion', 'pricetag'],
  'layout-grid': ['mci', 'view-grid-outline'],
  folder: ['ion', 'folder-outline'],
  'folder-open': ['ion', 'folder-open-outline'],
  'folder-plus': ['mci', 'folder-plus-outline'],
  layers: ['mci', 'layers-outline'],
  'arrange-front': ['mci', 'arrange-bring-forward'],
  'arrange-back': ['mci', 'arrange-send-backward'],
  'chevron-up': ['ion', 'chevron-up'],
  printer: ['ion', 'print'],
  settings: ['ion', 'settings-outline'],
  plus: ['ion', 'add'],
  minus: ['ion', 'remove'],
  square: ['ion', 'square-outline'],
  shapes: ['mci', 'shape-outline'],
  type: ['mci', 'format-text'],
  'qr-code': ['ion', 'qr-code-outline'],
  barcode: ['mci', 'barcode'],
  image: ['ion', 'image-outline'],
  calendar: ['ion', 'calendar-outline'],
  'calendar-clock': ['mci', 'calendar-clock'],
  'arrow-left': ['ion', 'arrow-back'],
  'chevron-down': ['ion', 'chevron-down'],
  'chevron-right': ['ion', 'chevron-forward'],
  eye: ['ion', 'eye-outline'],
  lock: ['ion', 'lock-closed'],
  'lock-open': ['ion', 'lock-open'],
  sparkles: ['ion', 'sparkles'],
  info: ['ion', 'information-circle-outline'],
  bluetooth: ['ion', 'bluetooth'],
  'bluetooth-off': ['mci', 'bluetooth-off'],
  'bluetooth-searching': ['mci', 'bluetooth-connect'],
  battery: ['mci', 'battery-50'],
  'battery-full': ['ion', 'battery-full'],
  lid: ['mci', 'window-closed-variant'],
  paper: ['mci', 'receipt'],
  radio: ['mci', 'radio-tower'],
  ruler: ['mci', 'ruler'],
  flask: ['mci', 'flask-outline'],
  cloud: ['ion', 'cloud-outline'],
  volume: ['ion', 'volume-high-outline'],
  'shield-check': ['mci', 'shield-check-outline'],
  check: ['ion', 'checkmark'],
  'check-circle': ['ion', 'checkmark-circle'],
  x: ['ion', 'close'],
  bold: ['mci', 'format-bold'],
  italic: ['mci', 'format-italic'],
  underline: ['mci', 'format-underline'],
  pencil: ['ion', 'pencil'],
  more: ['ion', 'ellipsis-horizontal'],
  signal: ['mci', 'signal'],
  wifi: ['ion', 'wifi'],
  warning: ['ion', 'warning-outline'],
  inbox: ['mci', 'inbox-outline'],
  trash: ['ion', 'trash-outline'],
  copy: ['ion', 'copy-outline'],
  bell: ['ion', 'notifications-outline'],
  sun: ['ion', 'sunny-outline'],
  moon: ['ion', 'moon-outline'],
  text: ['ion', 'text'],
  'align-left': ['mci', 'format-align-left'],
  'align-center': ['mci', 'format-align-center'],
  'align-right': ['mci', 'format-align-right'],
  circle: ['ion', 'ellipse-outline'],
  rotate: ['mci', 'rotate-right'],
  save: ['ion', 'save-outline'],
  refresh: ['ion', 'refresh'],
};

export interface IconProps {
  name: string;
  size?: number;
  color?: string;
}

export function Icon({ name, size = 20, color }: IconProps) {
  const theme = useTheme();
  const entry = MAP[name] ?? (['ion', 'help-circle-outline'] as [IconSet, string]);
  const tint = color ?? theme.colors.text;
  if (entry[0] === 'mci') {
    return <MaterialCommunityIcons name={entry[1] as any} size={size} color={tint} />;
  }
  return <Ionicons name={entry[1] as any} size={size} color={tint} />;
}
