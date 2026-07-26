'use client';

import { useState } from 'react';

export function HelpPanel() {
  const [open, setOpen] = useState(true);

  return (
    <div style={{ marginTop: '1rem', border: '1px solid #4a4f5a', borderRadius: 6, overflow: 'hidden' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%',
          textAlign: 'left',
          padding: '0.5rem 0.75rem',
          background: '#1b1f27',
          color: '#e5e7eb',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
      >
        {open ? '▾' : '▸'} Hoe speel je dit?
      </button>
      {open && (
        <div style={{ padding: '0.75rem 1rem', background: '#11141a', fontSize: 14, lineHeight: 1.5 }}>
          <p>
            <strong>Elke beurt: 2 acties</strong>, te kiezen uit Bouwen, Netwerken, Ontwikkelen, Verkopen, Lenen.
          </p>

          <table style={{ borderCollapse: 'collapse', marginBottom: '0.75rem' }}>
            <tbody>
              <tr>
                <td style={{ padding: '2px 8px 2px 0', fontWeight: 'bold' }}>Bouwen</td>
                <td>Plaats een industrietegel in een regio-slot</td>
              </tr>
              <tr>
                <td style={{ padding: '2px 8px 2px 0', fontWeight: 'bold' }}>Netwerken</td>
                <td>Leg een link tussen 2 aangrenzende regio&apos;s</td>
              </tr>
              <tr>
                <td style={{ padding: '2px 8px 2px 0', fontWeight: 'bold' }}>Ontwikkelen</td>
                <td>Sla je volgende tegelniveau over (goedkoper/beter later), zonder nu te bouwen</td>
              </tr>
              <tr>
                <td style={{ padding: '2px 8px 2px 0', fontWeight: 'bold' }}>Verkopen</td>
                <td>Verkoop een gebouwde Handelspost/Media-tegel voor geld + punten</td>
              </tr>
              <tr>
                <td style={{ padding: '2px 8px 2px 0', fontWeight: 'bold' }}>Lenen</td>
                <td>+30 sats nu, maar permanent lager inkomen</td>
              </tr>
            </tbody>
          </table>

          <p>
            <strong>Bouwen, stap voor stap:</strong> kies een regio → kies een leeg slot (elk slot staat maar 2
            industrietypes toe) → industrietype en kaart-opties passen zich automatisch aan → klik Bouw. Het
            &quot;Voorbeeld&quot;-regeltje laat vooraf zien wat het kost.
          </p>

          <p>
            <strong>De 6 industrietypes:</strong> Energiecentrale/Infrastructuur geven meteen punten + energie/
            bandbreedte bij bouwen. Handelspost/Media &amp; Educatie moet je later apart <em>verkopen</em> voor geld +
            punten. Netwerkhub geeft verkoop-capaciteit (nodig om te kunnen verkopen). Kluis geeft meteen punten.
          </p>

          <p>
            <strong>Om te verkopen</strong> heb je een Handelspost/Media-tegel + een Netwerkhub nodig die via een
            Link met elkaar verbonden zijn.
          </p>

          <p style={{ marginBottom: 0 }}>
            <strong>Eerste zetten-tip:</strong> bouw eerst een Energiecentrale of Infrastructuur (directe punten +
            resources), werk daarna toe naar een Netwerkhub + Handelspost met een Link ertussen.
          </p>
        </div>
      )}
    </div>
  );
}
