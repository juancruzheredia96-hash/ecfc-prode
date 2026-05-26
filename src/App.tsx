import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  deleteDoc,
  addDoc,
  getDocs,
} from 'firebase/firestore';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyCkblA_3HqM6G8PBaAfL4av157HubinXSY',
  authDomain: 'prode-elefante.firebaseapp.com',
  projectId: 'prode-elefante',
  storageBucket: 'prode-elefante.firebasestorage.app',
  messagingSenderId: '547829989373',
  appId: '1:547829989373:web:d7e5ad010f24c02e062394',
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);
const provider = new GoogleAuthProvider();

const MARFIL = '#dbd6c0';
const BORDO = '#4e1a1b';
const BORDO_LIGHT = '#7a2e2f';
const BORDO_DARK = '#2e0f10';
const MARFIL_DARK = '#b8b09a';
const MARFIL_LIGHT = '#f0ece0';
const VERDE = '#2e7d32';
const AMARILLO = '#e65100';
const ROJO = '#c62828';

const PAISES: Record<string, string> = {
  Argentina: 'ar',
  Brasil: 'br',
  Uruguay: 'uy',
  Paraguay: 'py',
  Chile: 'cl',
  Colombia: 'co',
  Ecuador: 'ec',
  Perú: 'pe',
  Bolivia: 'bo',
  Venezuela: 've',
  México: 'mx',
  EEUU: 'us',
  Canadá: 'ca',
  'Costa Rica': 'cr',
  Panamá: 'pa',
  Honduras: 'hn',
  Jamaica: 'jm',
  'El Salvador': 'sv',
  Trinidad: 'tt',
  Alemania: 'de',
  Francia: 'fr',
  España: 'es',
  Portugal: 'pt',
  Italia: 'it',
  Inglaterra: 'gb-eng',
  Holanda: 'nl',
  Bélgica: 'be',
  Croacia: 'hr',
  Austria: 'at',
  Suiza: 'ch',
  Dinamarca: 'dk',
  Polonia: 'pl',
  Serbia: 'rs',
  Escocia: 'gb-sct',
  Turquía: 'tr',
  Ucrania: 'ua',
  Hungría: 'hu',
  Japón: 'jp',
  'Corea del Sur': 'kr',
  'Arabia Saudita': 'sa',
  Irán: 'ir',
  Australia: 'au',
  Marruecos: 'ma',
  Senegal: 'sn',
  Nigeria: 'ng',
  Ghana: 'gh',
  Camerún: 'cm',
  Egipto: 'eg',
  Sudáfrica: 'za',
  Noruega: 'no',
  Suecia: 'se',
  Eslovenia: 'si',
  Eslovaquia: 'sk',
  'Bosnia y Herzegovina': 'ba',
  'Rep. Checa': 'cz',
  'República Checa': 'cz',
  Haití: 'ht',
  Qatar: 'qa',
  Túnez: 'tn',
  Curazao: 'cw',
  'Costa de Marfil': 'ci',
  'Cabo Verde': 'cv',
  'Nueva Zelanda': 'nz',
  Jordania: 'jo',
  Argelia: 'dz',
  Algeria: 'dz',
  Uzbekistán: 'uz',
  'RD Congo': 'cd',
  Irak: 'iq',
  Rumanía: 'ro',
  Albania: 'al',
  Kosovo: 'xk',
  'Macedonia del Norte': 'mk',
  'Irlanda del Norte': 'gb-nir',
  Gales: 'gb-wls',
  Irlanda: 'ie',
  'Por definir': '',
};

function FlagImg({ pais, size = 24 }: { pais: string; size?: number }) {
  const code = PAISES[pais];
  if (!code) return <span style={{ fontSize: size, lineHeight: 1 }}>🏳️</span>;
  return (
    <img
      src={`https://flagcdn.com/w40/${code}.png`}
      alt={pais}
      style={{
        width: size,
        height: 'auto',
        borderRadius: 2,
        objectFit: 'cover',
      }}
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = 'none';
      }}
    />
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Barlow', sans-serif; background: #1a1a1a; display: flex; justify-content: center; padding: 20px 0 40px; min-height: 100vh; }
  input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
  input[type=number] { -moz-appearance: textfield; }
  button { cursor: pointer; font-family: 'Barlow', sans-serif; }
  input, select { font-family: 'Barlow', sans-serif; }
`;

function calcPts(
  gL: number | null,
  gV: number | null,
  mL: number | null,
  mV: number | null
) {
  if (mL === null || mV === null || gL === null || gV === null) return null;
  let p = 0;
  if (mL === gL) p++;
  if (mV === gV) p++;
  if (mL === gL && mV === gV) p++;
  return p;
}

function Shield() {
  return (
    <img
      src="https://i.imgur.com/0e3BR0T.png"
      alt="Escudo ECFC"
      style={{ width: 36, height: 36, objectFit: 'contain' }}
    />
  );
}

function Badge({ pts }: { pts: number | null }) {
  if (pts === null) return null;
  const cfg =
    pts === 3
      ? { color: VERDE, icon: '✓', label: '3' }
      : pts >= 1
      ? { color: AMARILLO, icon: '✓', label: String(pts) }
      : { color: ROJO, icon: '✕', label: '0' };
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        border: `2px solid ${cfg.color}`,
        padding: '3px 8px',
        minWidth: 48,
        justifyContent: 'center',
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 600, color: cfg.color }}>
        {cfg.icon}
      </span>
      <span style={{ fontSize: 13, fontWeight: 600, color: cfg.color }}>
        {cfg.label}
      </span>
    </div>
  );
}

function inputStyle(extra?: object) {
  return {
    border: `1px solid ${BORDO_LIGHT}`,
    borderRadius: 6,
    padding: '0 10px',
    fontSize: 13,
    background: MARFIL_LIGHT,
    color: BORDO_DARK,
    height: 34,
    width: '100%',
    ...extra,
  };
}

function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  async function handleLogin() {
    setLoading(true);
    setError('');
    try {
      await signInWithPopup(auth, provider);
    } catch {
      setError('No se pudo iniciar sesión. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  }
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 500,
        padding: 32,
        background: MARFIL_LIGHT,
        gap: 24,
      }}
    >
      <Shield />
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: BORDO }}>
          Elefante y Castillo FC
        </div>
        <div style={{ fontSize: 13, color: BORDO_LIGHT, marginTop: 4 }}>
          Prode Mundial 2026
        </div>
      </div>
      <button
        onClick={handleLogin}
        disabled={loading}
        style={{
          background: BORDO,
          color: MARFIL,
          border: 'none',
          borderRadius: 8,
          padding: '12px 24px',
          fontSize: 14,
          fontWeight: 600,
          width: '100%',
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? 'Entrando...' : '🔑 Ingresar con Google'}
      </button>
      {error && <div style={{ color: ROJO, fontSize: 12 }}>{error}</div>}
      <div style={{ fontSize: 11, color: '#aaa', textAlign: 'center' }}>
        Al ingresar aparecés en la tabla del prode
      </div>
    </div>
  );
}

function MatchCard({ match, userId }: { match: any; userId: string }) {
  const [mL, setML] = useState<number | null>(null);
  const [mV, setMV] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const hasResult = match.gL !== null && match.gL !== undefined;
  const pts = calcPts(match.gL ?? null, match.gV ?? null, mL, mV);

  useEffect(() => {
    if (!userId) return;
    getDoc(doc(db, 'pronosticos', `${userId}_${match.id}`)).then((snap) => {
      if (snap.exists()) {
        setML(snap.data().mL);
        setMV(snap.data().mV);
        setSaved(true);
      }
    });
  }, [match.id, userId]);

  async function save() {
    if (mL === null || mV === null) return;
    await setDoc(doc(db, 'pronosticos', `${userId}_${match.id}`), {
      userId,
      matchId: match.id,
      mL,
      mV,
      updatedAt: serverTimestamp(),
    });
    setSaved(true);
  }

  return (
    <div
      style={{
        background: 'white',
        borderRadius: 12,
        border: '0.5px solid #e0ddd5',
        padding: '10px 12px',
        marginBottom: 8,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontSize: 10,
            color: MARFIL,
            fontWeight: 600,
            background: BORDO,
            padding: '2px 8px',
            borderRadius: 3,
          }}
        >
          {match.grupo}
        </span>
        <span style={{ fontSize: 10, color: '#888' }}>🕐 {match.hora} Hs</span>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 4,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flex: 1 }}>
          <FlagImg pais={match.localN} size={24} />
          <span style={{ fontSize: 12, fontWeight: 500 }}>{match.localN}</span>
        </div>
        <div
          style={{ minWidth: 72, display: 'flex', justifyContent: 'center' }}
        >
          {hasResult ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                background: BORDO,
                borderRadius: 4,
                padding: '3px 10px',
              }}
            >
              <span style={{ color: MARFIL, fontSize: 14, fontWeight: 600 }}>
                {match.gL}
              </span>
              <span style={{ color: MARFIL_DARK }}>-</span>
              <span style={{ color: MARFIL, fontSize: 14, fontWeight: 600 }}>
                {match.gV}
              </span>
            </div>
          ) : (
            <span style={{ color: '#aaa', fontSize: 11 }}>vs</span>
          )}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            flex: 1,
            flexDirection: 'row-reverse',
          }}
        >
          <FlagImg pais={match.visitaN} size={24} />
          <span style={{ fontSize: 12, fontWeight: 500, textAlign: 'right' }}>
            {match.visitaN}
          </span>
        </div>
      </div>
      <div
        style={{ borderTop: '0.5px solid #eee', paddingTop: 8, marginTop: 8 }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <span style={{ fontSize: 10, color: '#888' }}>✏️ Pronóstico</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            {['mL', 'mV'].map((field, i) => (
              <span
                key={field}
                style={{ display: 'flex', alignItems: 'center', gap: 5 }}
              >
                {i === 1 && (
                  <span style={{ fontSize: 13, color: '#aaa' }}>-</span>
                )}
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={
                    (field === 'mL' ? mL : mV) !== null
                      ? (field === 'mL' ? mL : mV)!
                      : ''
                  }
                  placeholder="–"
                  disabled={hasResult}
                  onChange={(e) => {
                    const v =
                      e.target.value === '' ? null : parseInt(e.target.value);
                    field === 'mL' ? setML(v) : setMV(v);
                    setSaved(false);
                  }}
                  style={{
                    width: 32,
                    height: 28,
                    textAlign: 'center',
                    fontSize: 14,
                    fontWeight: 600,
                    border: `1.5px solid ${BORDO_LIGHT}`,
                    borderRadius: 4,
                    background: MARFIL_LIGHT,
                    color: BORDO_DARK,
                    opacity: hasResult ? 0.7 : 1,
                  }}
                />
              </span>
            ))}
          </div>
          {hasResult ? (
            <Badge pts={pts} />
          ) : (
            <button
              onClick={save}
              disabled={mL === null || mV === null}
              style={{
                background: saved ? VERDE : BORDO,
                color: MARFIL,
                border: 'none',
                borderRadius: 4,
                fontSize: 10,
                padding: '4px 10px',
                fontWeight: 600,
                opacity: mL === null || mV === null ? 0.4 : 1,
              }}
            >
              {saved ? '✓ Guardado' : 'Guardar'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function TabPartidos({ userId }: { userId: string }) {
  const [partidos, setPartidos] = useState<any[]>([]);
  const [currentDay, setCurrentDay] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'partidos'),
      orderBy('fecha'),
      orderBy('hora')
    );
    return onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPartidos(data);
      setLoading(false);
    });
  }, []);

  const dias = [...new Set(partidos.map((p: any) => p.fecha))].sort();
  const diaActual = dias[currentDay] || '';
  const matchesDelDia = partidos.filter((p: any) => p.fecha === diaActual);

  function formatFecha(f: string) {
    if (!f) return '';
    const [y, m, d] = f.split('-');
    const meses = [
      '',
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ];
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const fecha = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    return `${dias[fecha.getDay()]} ${d} ${meses[parseInt(m)]}`;
  }

  if (loading)
    return (
      <div
        style={{
          padding: 40,
          textAlign: 'center',
          color: '#888',
          background: MARFIL_LIGHT,
          minHeight: 460,
        }}
      >
        Cargando partidos...
      </div>
    );

  if (partidos.length === 0)
    return (
      <div
        style={{
          padding: 32,
          textAlign: 'center',
          background: MARFIL_LIGHT,
          minHeight: 460,
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 12 }}>⚽</div>
        <div
          style={{
            fontSize: 14,
            color: BORDO,
            fontWeight: 600,
            marginBottom: 6,
          }}
        >
          No hay partidos cargados
        </div>
        <div style={{ fontSize: 12, color: '#888' }}>
          El administrador debe cargar los partidos desde el panel
        </div>
      </div>
    );

  return (
    <div style={{ padding: 12, background: MARFIL_LIGHT, minHeight: 460 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: BORDO,
          borderRadius: 8,
          padding: '8px 12px',
          marginBottom: 10,
        }}
      >
        <button
          onClick={() => setCurrentDay((d) => Math.max(0, d - 1))}
          disabled={currentDay === 0}
          style={{
            background: 'none',
            border: 'none',
            color: MARFIL,
            fontSize: 20,
            padding: '0 4px',
            opacity: currentDay === 0 ? 0.3 : 1,
          }}
        >
          ‹
        </button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: MARFIL, fontSize: 13, fontWeight: 600 }}>
            {formatFecha(diaActual)}
          </div>
          <div style={{ color: MARFIL_DARK, fontSize: 10 }}>
            {matchesDelDia[0]?.fase} · {matchesDelDia.length} partido
            {matchesDelDia.length !== 1 ? 's' : ''}
          </div>
        </div>
        <button
          onClick={() => setCurrentDay((d) => Math.min(dias.length - 1, d + 1))}
          disabled={currentDay === dias.length - 1}
          style={{
            background: 'none',
            border: 'none',
            color: MARFIL,
            fontSize: 20,
            padding: '0 4px',
            opacity: currentDay === dias.length - 1 ? 0.3 : 1,
          }}
        >
          ›
        </button>
      </div>
      {matchesDelDia.map((m) => (
        <MatchCard key={m.id} match={m} userId={userId} />
      ))}
    </div>
  );
}

function TabTabla() {
  const [jugadores, setJugadores] = useState<any[]>([]);
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const fecha = `${pad(now.getDate())}/${pad(
    now.getMonth() + 1
  )}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

  useEffect(() => {
    const q = query(collection(db, 'usuarios'), orderBy('pts', 'desc'));
    return onSnapshot(q, (snap) => {
      setJugadores(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, []);

  return (
    <div style={{ padding: 12, background: MARFIL_LIGHT, minHeight: 460 }}>
      <div
        style={{
          background: 'white',
          borderRadius: 12,
          border: '0.5px solid #e0ddd5',
          overflow: 'hidden',
        }}
      >
        <div style={{ background: BORDO, padding: '10px 12px' }}>
          <div style={{ color: MARFIL, fontSize: 12, fontWeight: 600 }}>
            Tabla de posiciones
          </div>
          <div style={{ color: MARFIL_DARK, fontSize: 10, marginTop: 2 }}>
            {fecha}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            padding: '4px 12px',
            background: BORDO_DARK,
            gap: 6,
          }}
        >
          {['#', '', 'Jugador', 'Pts', '+Hoy', '▲▼'].map((h, i) => (
            <span
              key={i}
              style={{
                fontSize: 9,
                color: MARFIL_DARK,
                fontWeight: 500,
                minWidth:
                  i === 0
                    ? 18
                    : i === 1
                    ? 30
                    : i === 3
                    ? 38
                    : i === 4
                    ? 28
                    : i === 5
                    ? 22
                    : 'auto',
                flex: i === 2 ? 1 : undefined,
                textAlign: i >= 3 ? 'right' : 'left',
              }}
            >
              {h}
            </span>
          ))}
        </div>
        {jugadores.length === 0 && (
          <div
            style={{
              padding: 20,
              textAlign: 'center',
              fontSize: 12,
              color: '#aaa',
            }}
          >
            Aún no hay jugadores registrados
          </div>
        )}
        {jugadores.map((j, idx) => {
          const pos = idx + 1;
          const mov = j.mov || 0;
          const movEl =
            mov > 0 ? (
              <span style={{ color: VERDE }}>▲{mov}</span>
            ) : mov < 0 ? (
              <span style={{ color: ROJO }}>▼{Math.abs(mov)}</span>
            ) : (
              <span style={{ color: '#aaa' }}>—</span>
            );
          return (
            <div
              key={j.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                borderBottom: '0.5px solid #eee',
                gap: 6,
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: pos <= 3 ? BORDO : '#aaa',
                  minWidth: 18,
                }}
              >
                {pos}
              </span>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  border: `1.5px solid ${BORDO}`,
                  overflow: 'hidden',
                  flexShrink: 0,
                  background: MARFIL,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {j.photoURL ? (
                  <img
                    src={j.photoURL}
                    alt={j.nick}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <span style={{ fontSize: 11, fontWeight: 500, color: BORDO }}>
                    {(j.ini || '??').slice(0, 2)}
                  </span>
                )}
              </div>
              <span style={{ flex: 1, fontSize: 12 }}>
                {j.nick || 'Usuario'}
              </span>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: MARFIL,
                  background: BORDO,
                  padding: '2px 7px',
                  borderRadius: 3,
                  minWidth: 30,
                  textAlign: 'center',
                }}
              >
                {j.pts || 0}
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: VERDE,
                  minWidth: 28,
                  textAlign: 'right',
                }}
              >
                +{j.hoy || 0}
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  minWidth: 22,
                  textAlign: 'right',
                }}
              >
                {movEl}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

async function calcularPuntosPartido(matchId: string, gL: number, gV: number) {
  const pronosSnap = await getDocs(collection(db, 'pronosticos'));
  const delPartido = pronosSnap.docs.filter(
    (d) => d.data().matchId === matchId
  );
  for (const pDoc of delPartido) {
    const { userId, mL, mV } = pDoc.data();
    if (mL === null || mV === null) continue;
    let pts = 0;
    if (mL === gL) pts++;
    if (mV === gV) pts++;
    if (mL === gL && mV === gV) pts++;
    const userRef = doc(db, 'usuarios', userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) continue;
    const userData = userSnap.data();
    const ptsAntes = userData.pts || 0;
    const hoyAntes = userData.hoy || 0;
    const exactosAntes = userData.exactos || 0;
    const esExacto = pts === 3;
    const rachaActual = esExacto ? (userData.rachaActual || 0) + 1 : 0;
    const rachaMasLarga = Math.max(userData.rachaMasLarga || 0, rachaActual);
    await setDoc(
      userRef,
      {
        pts: ptsAntes + pts,
        hoy: hoyAntes + pts,
        exactos: esExacto ? exactosAntes + 1 : exactosAntes,
        rachaActual,
        rachaMasLarga,
      },
      { merge: true }
    );
    await setDoc(pDoc.ref, { pts, calculado: true }, { merge: true });
  }
  const usuariosSnap = await getDocs(
    query(collection(db, 'usuarios'), orderBy('pts', 'desc'))
  );
  const updates = usuariosSnap.docs.map((d, idx) =>
    setDoc(
      d.ref,
      { pos: idx + 1, mov: (d.data().posAnterior || idx + 1) - (idx + 1) },
      { merge: true }
    )
  );
  await Promise.all(updates);
  usuariosSnap.docs.forEach(async (d, idx) => {
    await setDoc(d.ref, { posAnterior: idx + 1 }, { merge: true });
  });
}

function FormPartido({
  onSave,
  onCancel,
  initial,
}: {
  onSave: (d: any) => void;
  onCancel: () => void;
  initial?: any;
}) {
  const [form, setForm] = useState({
    fecha: initial?.fecha || '',
    hora: initial?.hora || '',
    fase: initial?.fase || 'Grupos',
    grupo: initial?.grupo || '',
    localN: initial?.localN || 'Por definir',
    visitaN: initial?.visitaN || 'Por definir',
  });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const fases = [
    'Grupos',
    'Octavos',
    'Cuartos',
    'Semifinal',
    'Tercer puesto',
    'Final',
  ];
  const mundialPaises = [
    'Argentina',
    'Australia',
    'Austria',
    'Bélgica',
    'Bosnia y Herzegovina',
    'Brasil',
    'Cabo Verde',
    'Canadá',
    'Colombia',
    'Corea del Sur',
    'Costa de Marfil',
    'Croacia',
    'Curazao',
    'Ecuador',
    'Egipto',
    'Escocia',
    'España',
    'EEUU',
    'Francia',
    'Ghana',
    'Haití',
    'Holanda',
    'Inglaterra',
    'Irak',
    'Irán',
    'Japón',
    'Jordania',
    'Marruecos',
    'México',
    'Nueva Zelanda',
    'Noruega',
    'Panamá',
    'Paraguay',
    'Portugal',
    'Qatar',
    'RD Congo',
    'Rep. Checa',
    'Arabia Saudita',
    'Senegal',
    'Sudáfrica',
    'Suecia',
    'Suiza',
    'Túnez',
    'Turquía',
    'Uruguay',
    'Uzbekistán',
    'Argelia',
  ].sort();
  const paises = ['Por definir', ...mundialPaises];

  return (
    <div
      style={{
        background: 'white',
        borderRadius: 12,
        border: '0.5px solid #e0ddd5',
        padding: 14,
        marginBottom: 10,
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: BORDO,
          marginBottom: 10,
        }}
      >
        {initial ? '✏️ Editar partido' : '➕ Nuevo partido'}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}
        >
          <div>
            <div style={{ fontSize: 10, color: '#888', marginBottom: 3 }}>
              Fecha
            </div>
            <input
              type="date"
              value={form.fecha}
              onChange={(e) => set('fecha', e.target.value)}
              style={inputStyle()}
            />
          </div>
          <div>
            <div style={{ fontSize: 10, color: '#888', marginBottom: 3 }}>
              Horario
            </div>
            <input
              type="time"
              value={form.hora}
              onChange={(e) => set('hora', e.target.value)}
              style={inputStyle()}
            />
          </div>
        </div>
        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}
        >
          <div>
            <div style={{ fontSize: 10, color: '#888', marginBottom: 3 }}>
              Fase
            </div>
            <select
              value={form.fase}
              onChange={(e) => set('fase', e.target.value)}
              style={{ ...inputStyle(), padding: '0 6px' }}
            >
              {fases.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 10, color: '#888', marginBottom: 3 }}>
              Grupo (opcional)
            </div>
            <input
              placeholder="Ej: A"
              value={form.grupo}
              onChange={(e) => set('grupo', e.target.value)}
              style={inputStyle()}
            />
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: '#888', marginBottom: 3 }}>
            País local
          </div>
          <select
            value={form.localN}
            onChange={(e) => set('localN', e.target.value)}
            style={{ ...inputStyle(), padding: '0 6px' }}
          >
            {paises.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <div style={{ fontSize: 10, color: '#888', marginBottom: 3 }}>
            País visitante
          </div>
          <select
            value={form.visitaN}
            onChange={(e) => set('visitaN', e.target.value)}
            style={{ ...inputStyle(), padding: '0 6px' }}
          >
            {paises.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              background: 'none',
              border: `1px solid ${BORDO_LIGHT}`,
              borderRadius: 6,
              padding: 9,
              fontSize: 12,
              color: BORDO,
            }}
          >
            Cancelar
          </button>
          <button
            onClick={() => onSave(form)}
            style={{
              flex: 2,
              background: BORDO,
              color: MARFIL,
              border: 'none',
              borderRadius: 6,
              padding: 9,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {initial ? 'Guardar cambios' : 'Agregar partido'}
          </button>
        </div>
      </div>
    </div>
  );
}

function FormResultado({
  partidos,
  onClose,
}: {
  partidos: any[];
  onClose: () => void;
}) {
  const [matchId, setMatchId] = useState('');
  const [gL, setGL] = useState('');
  const [gV, setGV] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const sinResultado = partidos.filter(
    (p) => p.gL === undefined || p.gL === null
  );

  async function guardar() {
    if (!matchId || gL === '' || gV === '') return;
    setSaving(true);
    const gLNum = parseInt(gL);
    const gVNum = parseInt(gV);
    await setDoc(
      doc(db, 'partidos', matchId),
      { gL: gLNum, gV: gVNum },
      { merge: true }
    );
    await calcularPuntosPartido(matchId, gLNum, gVNum);
    setMsg('✓ Resultado guardado y puntos calculados');
    setMatchId('');
    setGL('');
    setGV('');
    setSaving(false);
    setTimeout(() => setMsg(''), 4000);
  }

  return (
    <div
      style={{
        background: 'white',
        borderRadius: 12,
        border: '0.5px solid #e0ddd5',
        padding: 14,
        marginBottom: 10,
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: BORDO,
          marginBottom: 10,
        }}
      >
        ✏️ Cargar resultado
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div>
          <div style={{ fontSize: 10, color: '#888', marginBottom: 3 }}>
            Partido
          </div>
          <select
            value={matchId}
            onChange={(e) => setMatchId(e.target.value)}
            style={{ ...inputStyle(), padding: '0 6px' }}
          >
            <option value="">Seleccioná un partido...</option>
            {sinResultado.map((p) => (
              <option key={p.id} value={p.id}>
                {p.localN} vs {p.visitaN} ({p.fecha})
              </option>
            ))}
          </select>
        </div>
        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}
        >
          <div>
            <div style={{ fontSize: 10, color: '#888', marginBottom: 3 }}>
              Goles local
            </div>
            <input
              type="number"
              min="0"
              max="20"
              value={gL}
              onChange={(e) => setGL(e.target.value)}
              placeholder="0"
              style={{ ...inputStyle(), textAlign: 'center' }}
            />
          </div>
          <div>
            <div style={{ fontSize: 10, color: '#888', marginBottom: 3 }}>
              Goles visitante
            </div>
            <input
              type="number"
              min="0"
              max="20"
              value={gV}
              onChange={(e) => setGV(e.target.value)}
              placeholder="0"
              style={{ ...inputStyle(), textAlign: 'center' }}
            />
          </div>
        </div>
        <button
          onClick={guardar}
          disabled={saving || !matchId || gL === '' || gV === ''}
          style={{
            background: BORDO,
            color: MARFIL,
            border: 'none',
            borderRadius: 6,
            padding: 10,
            fontSize: 13,
            fontWeight: 600,
            opacity: !matchId || gL === '' || gV === '' ? 0.4 : 1,
          }}
        >
          {saving ? 'Guardando...' : 'Guardar resultado'}
        </button>
        {msg && (
          <div style={{ color: VERDE, fontSize: 12, textAlign: 'center' }}>
            {msg}
          </div>
        )}
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: 11,
            color: '#888',
          }}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

function ImportarXLSX({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [preview, setPreview] = useState<any[]>([]);
  const [datos, setDatos] = useState<any[]>([]);

  function parsearCSV(text: string): any[] {
    const lines = text.split('\n').filter((l) => l.trim());
    const result: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i]
        .split(',')
        .map((c) => c.trim().replace(/^"|"$/g, ''));
      if (cols.length < 6) continue;
      const [fecha, hora, fase, grupo, localN, visitaN] = cols;
      if (!fecha || !hora || !fase || !localN || !visitaN) continue;
      if (fecha.toLowerCase() === 'fecha') continue;
      result.push({
        fecha: fecha.trim(),
        hora: hora.trim().slice(0, 5),
        fase: fase.trim(),
        grupo: grupo.trim(),
        localN: localN.trim(),
        visitaN: visitaN.trim(),
        gL: null,
        gV: null,
      });
    }
    return result;
  }

  async function leerArchivo(file: File) {
    setMsg('');
    setPreview([]);
    setDatos([]);
    try {
      const buf = await file.arrayBuffer();
      const decoder = new TextDecoder('utf-8');
      let text = decoder.decode(buf);
      if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
      const parsed = parsearCSV(text);
      if (parsed.length === 0) {
        setMsg('No se encontraron datos. Asegurate de subir un archivo CSV.');
        return;
      }
      setDatos(parsed);
      setPreview(parsed.slice(0, 5));
      setMsg(
        `✓ ${parsed.length} partidos detectados. Revisá la previa y confirmá.`
      );
    } catch (e) {
      setMsg('Error al leer el archivo.');
    }
  }

  async function importar() {
    if (datos.length === 0) return;
    setLoading(true);
    setMsg('Importando...');
    try {
      let ok = 0;
      for (const p of datos) {
        await addDoc(collection(db, 'partidos'), {
          ...p,
          createdAt: serverTimestamp(),
        });
        ok++;
        if (ok % 10 === 0) setMsg(`Importando... ${ok}/${datos.length}`);
      }
      setMsg(`✓ ${ok} partidos importados correctamente.`);
      setPreview([]);
      setDatos([]);
    } catch (e) {
      setMsg('Error al guardar en Firebase. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        background: 'white',
        borderRadius: 12,
        border: '0.5px solid #e0ddd5',
        padding: 14,
        marginBottom: 10,
      }}
    >
      <div
        style={{ fontSize: 12, fontWeight: 600, color: BORDO, marginBottom: 8 }}
      >
        📊 Importar desde CSV
      </div>
      <div
        style={{
          background: MARFIL_LIGHT,
          border: `0.5px solid ${BORDO_LIGHT}`,
          borderRadius: 6,
          padding: '8px 10px',
          marginBottom: 10,
          fontSize: 10,
          color: BORDO_DARK,
        }}
      >
        <strong>⚠️ Usar archivo CSV, no xlsx.</strong> Abrí el Excel, guardalo
        como CSV (separado por comas) y subí ese archivo.
        <br />
        Columnas:{' '}
        <strong>Fecha, Horario, Fase, Grupo, País Local, País Visitante</strong>
      </div>
      <input
        type="file"
        accept=".csv"
        onChange={(e) => e.target.files?.[0] && leerArchivo(e.target.files[0])}
        style={{ fontSize: 12, marginBottom: 10, width: '100%' }}
      />
      {preview.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 10, color: '#888', marginBottom: 4 }}>
            Previa (primeros 5):
          </div>
          {preview.map((p, i) => (
            <div
              key={i}
              style={{
                fontSize: 10,
                padding: '3px 0',
                borderBottom: '0.5px solid #eee',
                color: '#333',
              }}
            >
              {p.fecha} · {p.hora} · {p.fase} {p.grupo ? `Gr.${p.grupo}` : ''} ·{' '}
              {p.localN} vs {p.visitaN}
            </div>
          ))}
        </div>
      )}
      {msg && (
        <div
          style={{
            fontSize: 11,
            color: msg.startsWith('✓')
              ? VERDE
              : msg.startsWith('Importando')
              ? BORDO
              : ROJO,
            marginBottom: 8,
          }}
        >
          {msg}
        </div>
      )}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={onClose}
          style={{
            flex: 1,
            background: 'none',
            border: `1px solid #ccc`,
            borderRadius: 6,
            padding: 8,
            fontSize: 12,
            color: '#666',
          }}
        >
          Cancelar
        </button>
        <button
          onClick={importar}
          disabled={datos.length === 0 || loading}
          style={{
            flex: 2,
            background: BORDO,
            color: MARFIL,
            border: 'none',
            borderRadius: 6,
            padding: 8,
            fontSize: 12,
            fontWeight: 600,
            opacity: datos.length === 0 || loading ? 0.4 : 1,
          }}
        >
          {loading
            ? 'Importando...'
            : `Importar ${datos.length > 0 ? datos.length : ''} partidos`}
        </button>
      </div>
    </div>
  );
}

function AdminPanel({ onBack }: { onBack: () => void }) {
  const [partidos, setPartidos] = useState<any[]>([]);
  const [vista, setVista] = useState<
    'menu' | 'nuevo' | 'resultado' | 'lista' | 'xlsx'
  >('menu');
  const [editando, setEditando] = useState<any>(null);
  const [confirmBorrarTodo, setConfirmBorrarTodo] = useState(false);
  const [confirmCerrarJornada, setConfirmCerrarJornada] = useState(false);
  const [loading, setLoading] = useState(false);

  async function cerrarJornada() {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'usuarios'));
      for (const d of snap.docs) {
        await setDoc(d.ref, { hoy: 0 }, { merge: true });
      }
      setMsg('✓ Jornada cerrada. +Hoy reseteado para todos.');
      setConfirmCerrarJornada(false);
      setTimeout(() => setMsg(''), 4000);
    } catch (e) {
      setMsg('Error al cerrar jornada.');
    } finally {
      setLoading(false);
    }
  }
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [lockHoras, setLockHoras] = useState('1');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const q = query(
      collection(db, 'partidos'),
      orderBy('fecha'),
      orderBy('hora')
    );
    return onSnapshot(q, (snap) =>
      setPartidos(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
  }, []);

  async function guardarPartido(form: any) {
    if (editando) {
      await setDoc(
        doc(db, 'partidos', editando.id),
        { ...form, updatedAt: serverTimestamp() },
        { merge: true }
      );
      setMsg('✓ Partido actualizado');
    } else {
      await addDoc(collection(db, 'partidos'), {
        ...form,
        gL: null,
        gV: null,
        createdAt: serverTimestamp(),
      });
      setMsg('✓ Partido agregado');
    }
    setVista('menu');
    setEditando(null);
    setTimeout(() => setMsg(''), 3000);
  }

  async function borrarTodo() {
    setLoading(true);
    setMsg('');
    try {
      const snap = await getDocs(collection(db, 'partidos'));
      for (const d of snap.docs) await deleteDoc(doc(db, 'partidos', d.id));
      setMsg('✓ Todos los partidos eliminados.');
      setTimeout(() => setMsg(''), 3000);
    } catch (e) {
      setMsg('Error al eliminar.');
    } finally {
      setLoading(false);
    }
  }

  async function eliminar(id: string) {
    await deleteDoc(doc(db, 'partidos', id));
    setConfirmDelete(null);
    setMsg('Partido eliminado');
    setTimeout(() => setMsg(''), 3000);
  }

  return (
    <div style={{ padding: 12, background: MARFIL_LIGHT, minHeight: 460 }}>
      <button
        onClick={onBack}
        style={{
          background: 'none',
          border: 'none',
          color: BORDO,
          fontSize: 12,
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        ← Volver al perfil
      </button>
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: BORDO,
          marginBottom: 10,
        }}
      >
        🛡️ Panel de administrador
      </div>

      {msg && (
        <div
          style={{
            background: VERDE,
            color: 'white',
            borderRadius: 6,
            padding: '8px 12px',
            fontSize: 12,
            marginBottom: 10,
          }}
        >
          {msg}
        </div>
      )}

      {vista === 'nuevo' || editando ? (
        <FormPartido
          onSave={guardarPartido}
          onCancel={() => {
            setVista('menu');
            setEditando(null);
          }}
          initial={editando}
        />
      ) : vista === 'resultado' ? (
        <FormResultado partidos={partidos} onClose={() => setVista('menu')} />
      ) : vista === 'xlsx' ? (
        <ImportarXLSX onClose={() => setVista('menu')} />
      ) : vista === 'lista' ? (
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: BORDO,
              marginBottom: 8,
            }}
          >
            📋 Partidos cargados ({partidos.length})
          </div>
          {partidos.map((p) => (
            <div
              key={p.id}
              style={{
                background: 'white',
                borderRadius: 8,
                border: '0.5px solid #e0ddd5',
                padding: '10px 12px',
                marginBottom: 6,
              }}
            >
              {confirmDelete === p.id ? (
                <div>
                  <div style={{ fontSize: 12, color: ROJO, marginBottom: 8 }}>
                    ¿Eliminar {p.localN} vs {p.visitaN}?
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      style={{
                        flex: 1,
                        background: 'none',
                        border: `1px solid #ccc`,
                        borderRadius: 6,
                        padding: 7,
                        fontSize: 11,
                      }}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => eliminar(p.id)}
                      style={{
                        flex: 1,
                        background: ROJO,
                        color: 'white',
                        border: 'none',
                        borderRadius: 6,
                        padding: 7,
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 500 }}>
                      <FlagImg pais={p.localN} size={16} /> {p.localN} vs{' '}
                      {p.visitaN} <FlagImg pais={p.visitaN} size={16} />
                    </div>
                    <div style={{ fontSize: 10, color: '#888' }}>
                      {p.fecha} · {p.hora} Hs · {p.fase}{' '}
                      {p.grupo ? `· Grupo ${p.grupo}` : ''}
                    </div>
                    {p.gL !== null && p.gL !== undefined && (
                      <div style={{ fontSize: 10, color: VERDE, marginTop: 2 }}>
                        Resultado: {p.gL}-{p.gV}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setEditando(p)}
                    style={{
                      background: 'none',
                      border: `1px solid ${BORDO_LIGHT}`,
                      borderRadius: 4,
                      padding: '4px 8px',
                      fontSize: 11,
                      color: BORDO,
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => setConfirmDelete(p.id)}
                    style={{
                      background: 'none',
                      border: `1px solid ${ROJO}`,
                      borderRadius: 4,
                      padding: '4px 8px',
                      fontSize: 11,
                      color: ROJO,
                    }}
                  >
                    🗑️
                  </button>
                </div>
              )}
            </div>
          ))}
          <button
            onClick={() => setVista('menu')}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 11,
              color: '#888',
              marginTop: 4,
            }}
          >
            ← Volver
          </button>
        </div>
      ) : (
        <>
          {confirmBorrarTodo && (
            <div
              style={{
                background: 'white',
                borderRadius: 12,
                border: `1.5px solid ${ROJO}`,
                padding: 16,
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: ROJO,
                  marginBottom: 6,
                }}
              >
                ⚠️ ¿Eliminar todos los partidos?
              </div>
              <div style={{ fontSize: 11, color: '#666', marginBottom: 12 }}>
                Esta acción no se puede deshacer. Se borrarán {partidos.length}{' '}
                partidos.
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setConfirmBorrarTodo(false)}
                  style={{
                    flex: 1,
                    background: 'none',
                    border: '1px solid #ccc',
                    borderRadius: 6,
                    padding: 9,
                    fontSize: 12,
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    borrarTodo();
                    setConfirmBorrarTodo(false);
                  }}
                  disabled={loading}
                  style={{
                    flex: 1,
                    background: ROJO,
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    padding: 9,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {loading ? 'Borrando...' : 'Sí, eliminar todo'}
                </button>
              </div>
            </div>
          )}

          <div
            style={{
              background: 'white',
              borderRadius: 12,
              border: '0.5px solid #e0ddd5',
              overflow: 'hidden',
              marginBottom: 10,
            }}
          >
            <div style={{ background: BORDO_DARK, padding: '8px 12px' }}>
              <span style={{ color: MARFIL, fontSize: 12, fontWeight: 600 }}>
                🔒 Pronósticos
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '11px 14px',
              }}
            >
              <span style={{ fontSize: 16 }}>🕐</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 500 }}>
                  Bloquear antes del partido
                </div>
                <div style={{ fontSize: 10, color: '#888' }}>
                  Horas antes del inicio
                </div>
              </div>
              <select
                value={lockHoras}
                onChange={(e) => setLockHoras(e.target.value)}
                style={{
                  fontSize: 11,
                  border: `1px solid ${BORDO_LIGHT}`,
                  borderRadius: 4,
                  padding: '3px 5px',
                  color: BORDO,
                  background: MARFIL_LIGHT,
                }}
              >
                <option value="1">1 hora</option>
                <option value="2">2 horas</option>
                <option value="3">3 horas</option>
                <option value="0">Al inicio</option>
              </select>
            </div>
          </div>

          <div
            style={{
              background: 'white',
              borderRadius: 12,
              border: '0.5px solid #e0ddd5',
              overflow: 'hidden',
              marginBottom: 10,
            }}
          >
            <div style={{ background: BORDO_DARK, padding: '8px 12px' }}>
              <span style={{ color: MARFIL, fontSize: 12, fontWeight: 600 }}>
                ⚽ Partidos
              </span>
            </div>
            {[
              {
                icon: '📊',
                label: 'Importar desde CSV',
                sub: 'Cargá el archivo de una vez',
                action: () => setVista('xlsx'),
              },
              {
                icon: '➕',
                label: 'Agregar partido',
                sub: 'Cargar uno por uno',
                action: () => setVista('nuevo'),
              },
              {
                icon: '📋',
                label: `Ver partidos (${partidos.length})`,
                sub: 'Editar o eliminar',
                action: () => setVista('lista'),
              },
              {
                icon: '✏️',
                label: 'Cargar resultado',
                sub: 'Actualizar marcador real',
                action: () => setVista('resultado'),
              },
              {
                icon: '🗑️',
                label: 'Eliminar todos los partidos',
                sub: 'Borra todo y empezá de nuevo',
                danger: true,
                action: () => setConfirmBorrarTodo(true),
              },
            ].map((row, i, arr) => (
              <div
                key={row.label}
                onClick={row.action}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '11px 14px',
                  borderBottom:
                    i < arr.length - 1 ? '0.5px solid #eee' : 'none',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: 16 }}>{row.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>
                    {row.label}
                  </div>
                  <div style={{ fontSize: 10, color: '#888' }}>{row.sub}</div>
                </div>
                <span style={{ color: '#ccc', fontSize: 16 }}>›</span>
              </div>
            ))}
          </div>

          <div
            style={{
              background: 'white',
              borderRadius: 12,
              border: '0.5px solid #e0ddd5',
              overflow: 'hidden',
            }}
          >
            <div style={{ background: BORDO_DARK, padding: '8px 12px' }}>
              <span style={{ color: MARFIL, fontSize: 12, fontWeight: 600 }}>
                👥 Usuarios
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '11px 14px',
                borderBottom: '0.5px solid #eee',
              }}
            >
              <span style={{ fontSize: 16 }}>🛡️</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 500 }}>
                  Asignar administradores
                </div>
                <div style={{ fontSize: 10, color: '#888' }}>
                  Hasta 5 admins en total
                </div>
              </div>
              <span style={{ color: '#ccc', fontSize: 16 }}>›</span>
            </div>
            <div style={{ padding: '11px 14px' }}>
              {confirmCerrarJornada ? (
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      color: BORDO,
                      fontWeight: 500,
                      marginBottom: 6,
                    }}
                  >
                    ¿Cerrar jornada y resetear +Hoy para todos?
                  </div>
                  <div
                    style={{ fontSize: 10, color: '#888', marginBottom: 10 }}
                  >
                    Los puntos totales no cambian, solo se resetea el contador
                    diario.
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => setConfirmCerrarJornada(false)}
                      style={{
                        flex: 1,
                        background: 'none',
                        border: '1px solid #ccc',
                        borderRadius: 6,
                        padding: 8,
                        fontSize: 12,
                      }}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={cerrarJornada}
                      disabled={loading}
                      style={{
                        flex: 1,
                        background: BORDO,
                        color: MARFIL,
                        border: 'none',
                        borderRadius: 6,
                        padding: 8,
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {loading ? 'Cerrando...' : 'Cerrar jornada'}
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    cursor: 'pointer',
                  }}
                  onClick={() => setConfirmCerrarJornada(true)}
                >
                  <span style={{ fontSize: 16 }}>🏁</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 500 }}>
                      Cerrar jornada
                    </div>
                    <div style={{ fontSize: 10, color: '#888' }}>
                      Resetea el +Hoy de todos los jugadores
                    </div>
                  </div>
                  <span style={{ color: '#ccc', fontSize: 16 }}>›</span>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function TabPerfil({
  user,
  onLogout,
  isAdmin,
}: {
  user: any;
  onLogout: () => void;
  isAdmin: boolean;
}) {
  const [showAdmin, setShowAdmin] = useState(false);
  const [nick, setNick] = useState('');
  const [editingNick, setEditingNick] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    const ref = doc(db, 'usuarios', user.uid);
    return onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setUserData(d);
        setNick(d.nick || user.displayName?.split(' ')[0] || '');
      }
    });
  }, [user]);

  async function saveNick() {
    if (!user || !nick.trim()) return;
    await setDoc(
      doc(db, 'usuarios', user.uid),
      { nick: nick.trim(), ini: nick.trim().slice(0, 2).toUpperCase() },
      { merge: true }
    );
    setEditingNick(false);
  }

  const ini = (nick || 'U').slice(0, 2).toUpperCase();
  if (showAdmin) return <AdminPanel onBack={() => setShowAdmin(false)} />;

  return (
    <div style={{ padding: 12, background: MARFIL_LIGHT, minHeight: 460 }}>
      <div
        style={{
          background: 'white',
          borderRadius: 12,
          border: '0.5px solid #e0ddd5',
          padding: '20px 16px',
          marginBottom: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: MARFIL,
            border: `3px solid ${BORDO}`,
            overflow: 'hidden',
            position: 'relative',
            flexShrink: 0,
          }}
        >
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt="Foto de perfil"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 26,
                fontWeight: 600,
                color: BORDO,
              }}
            >
              {ini}
            </div>
          )}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              background: BORDO,
              borderRadius: '50%',
              width: 22,
              height: 22,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: MARFIL,
              fontSize: 13,
            }}
          >
            📷
          </div>
        </div>
        {editingNick ? (
          <div style={{ display: 'flex', gap: 8, width: '100%' }}>
            <input
              value={nick}
              onChange={(e) => setNick(e.target.value)}
              style={{ flex: 1, ...inputStyle() }}
            />
            <button
              onClick={saveNick}
              style={{
                background: BORDO,
                color: MARFIL,
                border: 'none',
                borderRadius: 6,
                padding: '0 14px',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              OK
            </button>
          </div>
        ) : (
          <div
            onClick={() => setEditingNick(true)}
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: BORDO,
              cursor: 'pointer',
            }}
          >
            {nick || 'Sin nick'} ✏️
          </div>
        )}
        {isAdmin && (
          <div
            style={{
              background: BORDO,
              color: MARFIL,
              fontSize: 11,
              padding: '3px 12px',
              borderRadius: 20,
            }}
          >
            🛡️ Admin
          </div>
        )}

        <div
          style={{
            width: '100%',
            background: BORDO,
            borderRadius: 8,
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span style={{ fontSize: 22 }}>🔥</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: MARFIL_DARK }}>
              Racha actual (exactos)
            </div>
            <div style={{ fontSize: 18, fontWeight: 600, color: MARFIL }}>
              {userData?.rachaActual || 0} seguidos
            </div>
          </div>
          <div
            style={{
              width: 1,
              background: BORDO_LIGHT,
              height: 36,
              margin: '0 4px',
            }}
          />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: MARFIL_DARK }}>
              Racha más larga
            </div>
            <div style={{ fontSize: 18, fontWeight: 600, color: MARFIL }}>
              {userData?.rachaMasLarga || 0}
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 8,
            width: '100%',
          }}
        >
          {[
            { val: userData?.pts || 0, lbl: 'Puntos totales' },
            {
              val: userData?.pos ? `${userData.pos}°` : '—',
              lbl: 'Posición actual',
            },
            { val: userData?.exactos || 0, lbl: 'Resultados exactos' },
            {
              val: userData?.acierto ? `${userData.acierto}%` : '0%',
              lbl: 'Acierto de goles',
            },
          ].map((s) => (
            <div
              key={s.lbl}
              style={{
                background: MARFIL_LIGHT,
                borderRadius: 8,
                padding: 10,
                textAlign: 'center',
                border: '0.5px solid #e0ddd5',
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 600, color: BORDO }}>
                {s.val}
              </div>
              <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>
                {s.lbl}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{ fontSize: 12, fontWeight: 600, color: BORDO, marginBottom: 8 }}
      >
        ⚙️ Cuenta
      </div>
      <div
        style={{
          background: 'white',
          borderRadius: 12,
          border: '0.5px solid #e0ddd5',
          overflow: 'hidden',
        }}
      >
        {[
          {
            icon: '👤',
            label: 'Editar nick',
            action: () => setEditingNick(true),
          },
          ...(isAdmin
            ? [
                {
                  icon: '🛡️',
                  label: 'Panel de administrador',
                  action: () => setShowAdmin(true),
                },
              ]
            : []),
          {
            icon: '🚪',
            label: 'Cerrar sesión',
            action: onLogout,
            danger: true,
          },
        ].map((row, i, arr) => (
          <div
            key={row.label}
            onClick={row.action}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 16px',
              borderBottom: i < arr.length - 1 ? '0.5px solid #eee' : 'none',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: 17 }}>{row.icon}</span>
            <span
              style={{
                fontSize: 13,
                color: (row as any).danger ? ROJO : 'inherit',
              }}
            >
              {row.label}
            </span>
            <span style={{ marginLeft: 'auto', color: '#ccc', fontSize: 16 }}>
              ›
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('partidos');
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setAuthLoading(false);
      if (u) {
        const ref = doc(db, 'usuarios', u.uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          await setDoc(ref, {
            nick: u.displayName?.split(' ')[0] || 'Usuario',
            ini: (u.displayName || 'U').slice(0, 2).toUpperCase(),
            email: u.email,
            photoURL: u.photoURL || '',
            pts: 0,
            hoy: 0,
            mov: 0,
            rachaActual: 0,
            rachaMasLarga: 0,
            exactos: 0,
            acierto: 0,
            createdAt: serverTimestamp(),
          });
        } else {
          await setDoc(ref, { photoURL: u.photoURL || '' }, { merge: true });
        }
        const data = snap.exists() ? snap.data() : {};
        setIsAdmin(
          data.isAdmin === true || u.email === 'juancruzheredia96@gmail.com'
        );
      }
    });
  }, []);

  async function handleLogout() {
    await signOut(auth);
    setUser(null);
  }

  const tabs = [
    { id: 'partidos', icon: '⚽', label: 'Partidos' },
    { id: 'tabla', icon: '🏆', label: 'Tabla' },
    { id: 'perfil', icon: '👤', label: 'Perfil' },
  ];

  return (
    <>
      <style>{css}</style>
      <div
        style={{
          width: 360,
          background: 'white',
          borderRadius: 28,
          overflow: 'hidden',
          border: '0.5px solid #444',
          boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
        }}
      >
        <div
          style={{
            background: BORDO,
            padding: '10px 20px 6px',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ color: MARFIL, fontSize: 11, fontWeight: 500 }}>
            9:41
          </span>
          <span style={{ color: MARFIL, fontSize: 11 }}>WiFi 🔋</span>
        </div>
        <div
          style={{
            background: BORDO,
            padding: '10px 16px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <Shield />
          <div>
            <div style={{ color: MARFIL, fontSize: 15, fontWeight: 600 }}>
              Elefante y Castillo FC
            </div>
            <div style={{ color: MARFIL_DARK, fontSize: 11 }}>
              Prode Mundial 2026
            </div>
          </div>
          <div
            onClick={() => setActiveTab('perfil')}
            style={{
              marginLeft: 'auto',
              width: 32,
              height: 32,
              background: BORDO_LIGHT,
              border: `2px solid ${MARFIL}`,
              borderRadius: '50%',
              overflow: 'hidden',
              cursor: 'pointer',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="avatar"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span style={{ color: MARFIL, fontSize: 12, fontWeight: 600 }}>
                {user
                  ? (user.displayName || 'U').slice(0, 2).toUpperCase()
                  : '?'}
              </span>
            )}
          </div>
        </div>

        {authLoading ? (
          <div
            style={{
              padding: 40,
              textAlign: 'center',
              color: '#aaa',
              background: MARFIL_LIGHT,
            }}
          >
            Cargando...
          </div>
        ) : !user ? (
          <LoginScreen />
        ) : (
          <>
            {activeTab === 'partidos' && <TabPartidos userId={user.uid} />}
            {activeTab === 'tabla' && <TabTabla />}
            {activeTab === 'perfil' && (
              <TabPerfil
                user={user}
                onLogout={handleLogout}
                isAdmin={isAdmin}
              />
            )}
          </>
        )}

        <div
          style={{
            background: 'white',
            borderTop: '0.5px solid #eee',
            display: 'flex',
            justifyContent: 'space-around',
            padding: '8px 0 12px',
          }}
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                background: 'none',
                border: 'none',
                padding: '4px 16px',
                color: activeTab === t.id ? BORDO : '#aaa',
              }}
            >
              <span style={{ fontSize: 22 }}>{t.icon}</span>
              <span style={{ fontSize: 10 }}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
