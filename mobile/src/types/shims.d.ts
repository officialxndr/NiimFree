// Module shims for the pure-JS code encoders (no bundled type defs).
declare module 'qrcode-generator';
declare module 'jsbarcode/bin/barcodes/index.js' {
  const barcodes: Record<string, any>;
  export default barcodes;
}
