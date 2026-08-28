import { useEffect, useState } from 'react';
import QR from 'qrcode';

// QR рисуем настоящим кодом, а не картинкой-заглушкой: экран для того и
// сделан, чтобы его сканировали, и подделка проваливает демонстрацию на
// первой же попытке навести камеру.
export default function QrCode({ value, size = 220 }) {
  const [svg, setSvg] = useState('');

  useEffect(() => {
    let alive = true;
    QR.toString(value, {
      type: 'svg', margin: 0, errorCorrectionLevel: 'M',
      color: { dark: '#000000', light: '#00000000' },
    }).then((s) => { if (alive) setSvg(s); });
    return () => { alive = false; };
  }, [value]);

  return (
    <div
      className="qr"
      style={{ width: size, height: size }}
      // svg приходит из библиотеки по нашим же данным — стороннего ввода тут нет
      dangerouslySetInnerHTML={{ __html: svg }}
      role="img"
      aria-label="QR-код"
    />
  );
}
