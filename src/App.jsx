import { useState, useMemo } from "react";

const COLORS = {
  bg: "#0F1117",
  surface: "#181C27",
  card: "#1E2335",
  border: "#2A3050",
  accent: "#4FFFB0",
  accentDim: "#1A4A38",
  warn: "#FFB347",
  danger: "#FF5C5C",
  muted: "#8892B0",
  text: "#E6EDF3",
  textSub: "#A8B4CC",
};

const formatCOP = (n) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n || 0);

const TIPOS = ["Tarjeta de Crédito", "Crédito Libre Inversión"];

const EMPTY_PRODUCTO = {
  id: null, nombre: "", banco: "", tipo: TIPOS[0],
  saldo: "", cupoTotal: "", tasaMensual: "", fechaCorte: "", fechaPago: "",
  cuotas: "", cuotasMes: "",
};

const EMPTY_GASTO = {
  id: null, descripcion: "", monto: "", productoId: "", fecha: "", categoria: "Otro", cuotas: 1,
};

const CATEGORIAS = ["Alimentación", "Transporte", "Salud", "Educación", "Entretenimiento", "Hogar", "Ropa", "Tecnología", "Viajes", "Otro"];

const daysUntil = (dateStr) => {
  if (!dateStr) return null;
  const hoy = new Date();
  const target = new Date(new Date().getFullYear(), new Date().getMonth(), parseInt(dateStr));
  if (target < hoy) target.setMonth(target.getMonth() + 1);
  return Math.ceil((target - hoy) / (1000 * 60 * 60 * 24));
};

// ── Icons ──────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 18 }) => {
  const icons = {
    plus: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    card: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,
    credit: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
    list: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3" cy="6" r="1.5" fill="currentColor"/><circle cx="3" cy="12" r="1.5" fill="currentColor"/><circle cx="3" cy="18" r="1.5" fill="currentColor"/></svg>,
    dash: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
    trash: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
    bell: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    edit: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    close: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    check: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
    info: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  };
  return icons[name] || null;
};

// ── Shared Components ──────────────────────────────────────────────────────
const Badge = ({ children, color = COLORS.accent }) => (
  <span style={{ background: color + "22", color, border: `1px solid ${color}44`, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}>
    {children}
  </span>
);

const Input = ({ label, ...props }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    {label && <label style={{ fontSize: 12, color: COLORS.muted, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" }}>{label}</label>}
    <input
      {...props}
      style={{
        background: COLORS.bg, border: `1.5px solid ${COLORS.border}`, borderRadius: 10,
        padding: "10px 14px", color: COLORS.text, fontSize: 14, outline: "none",
        transition: "border-color 0.2s",
        ...props.style,
      }}
      onFocus={e => e.target.style.borderColor = COLORS.accent}
      onBlur={e => e.target.style.borderColor = COLORS.border}
    />
  </div>
);

const Select = ({ label, children, ...props }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    {label && <label style={{ fontSize: 12, color: COLORS.muted, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" }}>{label}</label>}
    <select
      {...props}
      style={{
        background: COLORS.bg, border: `1.5px solid ${COLORS.border}`, borderRadius: 10,
        padding: "10px 14px", color: COLORS.text, fontSize: 14, outline: "none",
        ...props.style,
      }}
    >
      {children}
    </select>
  </div>
);

const Btn = ({ children, variant = "primary", onClick, style = {}, ...props }) => {
  const styles = {
    primary: { background: COLORS.accent, color: "#0A1A10", border: "none" },
    secondary: { background: "transparent", color: COLORS.accent, border: `1.5px solid ${COLORS.accent}` },
    danger: { background: "transparent", color: COLORS.danger, border: `1.5px solid ${COLORS.danger}` },
    ghost: { background: "transparent", color: COLORS.muted, border: `1.5px solid ${COLORS.border}` },
  };
  return (
    <button
      onClick={onClick}
      {...props}
      style={{
        padding: "10px 18px", borderRadius: 10, fontWeight: 700, cursor: "pointer",
        display: "flex", alignItems: "center", gap: 7, fontSize: 14, transition: "opacity 0.15s",
        ...styles[variant], ...style,
      }}
      onMouseOver={e => e.currentTarget.style.opacity = "0.8"}
      onMouseOut={e => e.currentTarget.style.opacity = "1"}
    >
      {children}
    </button>
  );
};

const Modal = ({ title, onClose, children }) => (
  <div style={{
    position: "fixed", inset: 0, background: "#000A", zIndex: 100,
    display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
  }}>
    <div style={{
      background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 18,
      padding: 28, width: "100%", maxWidth: 540, maxHeight: "90vh", overflowY: "auto",
      boxShadow: "0 24px 64px #000A",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ margin: 0, color: COLORS.text, fontSize: 20, fontWeight: 800 }}>{title}</h2>
        <Btn variant="ghost" onClick={onClose} style={{ padding: "6px 10px" }}><Icon name="close" size={16} /></Btn>
      </div>
      {children}
    </div>
  </div>
);

const AlertChip = ({ days, label }) => {
  if (days === null) return null;
  const color = days <= 3 ? COLORS.danger : days <= 7 ? COLORS.warn : COLORS.accent;
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color }}>
      <Icon name="bell" size={12} />
      {label}: {days === 0 ? "¡Hoy!" : `${days}d`}
    </span>
  );
};

// ── MAIN APP ───────────────────────────────────────────────────────────────
export default function FinanzasApp() {
  const [tab, setTab] = useState("dashboard");
  const [productos, setProductos] = useState([
    { id: 1, nombre: "Visa Platino", banco: "Bancolombia", tipo: "Tarjeta de Crédito", saldo: 3200000, cupoTotal: 8000000, tasaMensual: 2.2, fechaCorte: "15", fechaPago: "25", cuotas: "", cuotasMes: 0 },
    { id: 2, nombre: "Crédito Libre", banco: "Davivienda", tipo: "Crédito Libre Inversión", saldo: 12000000, cupoTotal: "", tasaMensual: 1.8, fechaCorte: "", fechaPago: "5", cuotas: 48, cuotasMes: 350000 },
    { id: 3, nombre: "Mastercard Gold", banco: "BBVA", tipo: "Tarjeta de Crédito", saldo: 1800000, cupoTotal: 5000000, tasaMensual: 2.5, fechaCorte: "20", fechaPago: "3", cuotas: "", cuotasMes: 0 },
  ]);
  const [gastos, setGastos] = useState([
    { id: 1, descripcion: "Mercado", monto: 280000, productoId: 1, fecha: "2025-05-20", categoria: "Alimentación", cuotas: 1 },
    { id: 2, descripcion: "Netflix + Spotify", monto: 65000, productoId: 3, fecha: "2025-05-18", categoria: "Entretenimiento", cuotas: 1 },
    { id: 3, descripcion: "Cuota crédito", monto: 350000, productoId: 2, fecha: "2025-05-05", categoria: "Otro", cuotas: 1 },
  ]);
  const [modalProd, setModalProd] = useState(false);
  const [modalGasto, setModalGasto] = useState(false);
  const [editProd, setEditProd] = useState(null);
  const [editGasto, setEditGasto] = useState(null);
  const [formProd, setFormProd] = useState(EMPTY_PRODUCTO);
  const [formGasto, setFormGasto] = useState(EMPTY_GASTO);

  // ── Computed ──────────────────────────────────────────────────────────────
  const totalDeuda = useMemo(() => productos.reduce((a, p) => a + Number(p.saldo || 0), 0), [productos]);
  const pagoMesTotal = useMemo(() => productos.reduce((a, p) => a + Number(p.cuotasMes || 0), 0), [productos]);
  const interesesMes = useMemo(() => productos.reduce((a, p) => a + (Number(p.saldo || 0) * Number(p.tasaMensual || 0) / 100), 0), [productos]);

  const alertas = useMemo(() => {
    const arr = [];
    productos.forEach(p => {
      const dc = daysUntil(p.fechaCorte);
      const dp = daysUntil(p.fechaPago);
      if (dc !== null && dc <= 7) arr.push({ id: p.id, texto: `${p.nombre} — Corte en ${dc === 0 ? "¡hoy!" : dc + " días"}`, tipo: "corte", urgente: dc <= 3 });
      if (dp !== null && dp <= 7) arr.push({ id: p.id, texto: `${p.nombre} — Pago en ${dp === 0 ? "¡hoy!" : dp + " días"}`, tipo: "pago", urgente: dp <= 3 });
    });
    return arr;
  }, [productos]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const openNewProd = () => { setFormProd(EMPTY_PRODUCTO); setEditProd(null); setModalProd(true); };
  const openEditProd = (p) => { setFormProd({ ...p }); setEditProd(p.id); setModalProd(true); };
  const saveProd = () => {
    if (!formProd.nombre || !formProd.banco) return;
    if (editProd) {
      setProductos(prev => prev.map(p => p.id === editProd ? { ...formProd, id: editProd } : p));
    } else {
      setProductos(prev => [...prev, { ...formProd, id: Date.now(), saldo: Number(formProd.saldo), cupoTotal: Number(formProd.cupoTotal), tasaMensual: Number(formProd.tasaMensual), cuotasMes: Number(formProd.cuotasMes) || 0 }]);
    }
    setModalProd(false);
  };
  const deleteProd = (id) => setProductos(prev => prev.filter(p => p.id !== id));

  const openNewGasto = () => { setFormGasto(EMPTY_GASTO); setEditGasto(null); setModalGasto(true); };
  const openEditGasto = (g) => { setFormGasto({ ...g }); setEditGasto(g.id); setModalGasto(true); };
  const saveGasto = () => {
    if (!formGasto.descripcion || !formGasto.monto || !formGasto.productoId) return;
    if (editGasto) {
      setGastos(prev => prev.map(g => g.id === editGasto ? { ...formGasto, id: editGasto, monto: Number(formGasto.monto) } : g));
    } else {
      setGastos(prev => [...prev, { ...formGasto, id: Date.now(), monto: Number(formGasto.monto) }]);
    }
    setModalGasto(false);
  };
  const deleteGasto = (id) => setGastos(prev => prev.filter(g => g.id !== id));

  const getProd = (id) => productos.find(p => p.id === id || p.id === Number(id));

  // ── VIEWS ──────────────────────────────────────────────────────────────────
  const Dashboard = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Alertas */}
      {alertas.length > 0 && (
        <div style={{ background: COLORS.card, border: `1px solid ${COLORS.warn}44`, borderRadius: 14, padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, color: COLORS.warn, fontWeight: 700, fontSize: 14 }}>
            <Icon name="bell" size={15} /> Alertas próximas
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {alertas.map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: a.urgente ? COLORS.danger + "18" : COLORS.warn + "12", borderRadius: 8, fontSize: 13, color: a.urgente ? COLORS.danger : COLORS.warn }}>
                <Icon name="bell" size={13} /> {a.texto}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[
          { label: "Deuda Total", value: formatCOP(totalDeuda), color: COLORS.danger },
          { label: "Pago Este Mes", value: formatCOP(pagoMesTotal), color: COLORS.warn },
          { label: "Intereses/Mes", value: formatCOP(interesesMes), color: COLORS.accent },
          { label: "Productos", value: productos.length, color: COLORS.textSub },
        ].map((k, i) => (
          <div key={i} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 18 }}>
            <div style={{ fontSize: 11, color: COLORS.muted, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: k.color, fontFamily: "monospace" }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Productos resumen */}
      <div>
        <div style={{ fontSize: 13, color: COLORS.muted, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 12 }}>Tus Productos</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {productos.map(p => {
            const dc = daysUntil(p.fechaCorte);
            const dp = daysUntil(p.fechaPago);
            const pct = p.cupoTotal ? Math.round((Number(p.saldo) / Number(p.cupoTotal)) * 100) : null;
            return (
              <div key={p.id} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 800, color: COLORS.text, fontSize: 15 }}>{p.nombre}</div>
                    <div style={{ color: COLORS.muted, fontSize: 12, marginTop: 2 }}>{p.banco} · {p.tipo === "Tarjeta de Crédito" ? "TC" : "CLI"} · {p.tasaMensual}% MV</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 800, color: COLORS.danger, fontSize: 16, fontFamily: "monospace" }}>{formatCOP(p.saldo)}</div>
                    {pct !== null && <div style={{ fontSize: 11, color: COLORS.muted }}>{pct}% usado</div>}
                  </div>
                </div>
                {pct !== null && (
                  <div style={{ height: 5, background: COLORS.border, borderRadius: 99, marginBottom: 10, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: pct > 80 ? COLORS.danger : pct > 60 ? COLORS.warn : COLORS.accent, borderRadius: 99, transition: "width 0.5s" }} />
                  </div>
                )}
                <div style={{ display: "flex", gap: 12 }}>
                  <AlertChip days={dc} label="Corte" />
                  <AlertChip days={dp} label="Pago" />
                  {p.cuotasMes > 0 && <span style={{ fontSize: 12, color: COLORS.accent }}>{formatCOP(p.cuotasMes)}/mes</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Últimos gastos */}
      <div>
        <div style={{ fontSize: 13, color: COLORS.muted, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 12 }}>Últimos Gastos</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {gastos.slice(-5).reverse().map(g => {
            const prod = getProd(g.productoId);
            return (
              <div key={g.id} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 700, color: COLORS.text, fontSize: 14 }}>{g.descripcion}</div>
                  <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>{prod?.nombre} · {g.categoria}</div>
                </div>
                <div style={{ fontWeight: 800, color: COLORS.warn, fontFamily: "monospace" }}>{formatCOP(g.monto)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const Productos = () => (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ margin: 0, color: COLORS.text, fontSize: 20, fontWeight: 800 }}>Mis Productos</h2>
        <Btn onClick={openNewProd}><Icon name="plus" size={15} /> Agregar</Btn>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {productos.map(p => {
          const interes = (Number(p.saldo) * Number(p.tasaMensual)) / 100;
          const pct = p.cupoTotal ? Math.round((Number(p.saldo) / Number(p.cupoTotal)) * 100) : null;
          return (
            <div key={p.id} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 800, color: COLORS.text, fontSize: 16 }}>{p.nombre}</span>
                    <Badge color={p.tipo === "Tarjeta de Crédito" ? COLORS.accent : COLORS.warn}>
                      {p.tipo === "Tarjeta de Crédito" ? "TC" : "CLI"}
                    </Badge>
                  </div>
                  <div style={{ color: COLORS.muted, fontSize: 13 }}>{p.banco}</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn variant="ghost" onClick={() => openEditProd(p)} style={{ padding: "7px 10px" }}><Icon name="edit" size={14} /></Btn>
                  <Btn variant="danger" onClick={() => deleteProd(p.id)} style={{ padding: "7px 10px" }}><Icon name="trash" size={14} /></Btn>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
                {[
                  { label: "Saldo", value: formatCOP(p.saldo), color: COLORS.danger },
                  { label: "Tasa MV", value: `${p.tasaMensual}%`, color: COLORS.muted },
                  { label: "Interés/mes", value: formatCOP(interes), color: COLORS.warn },
                  ...(p.tipo === "Tarjeta de Crédito" ? [{ label: "Cupo total", value: formatCOP(p.cupoTotal), color: COLORS.textSub }] : []),
                  ...(p.cuotas ? [{ label: "Cuotas", value: p.cuotas, color: COLORS.textSub }] : []),
                  ...(p.cuotasMes ? [{ label: "Cuota/mes", value: formatCOP(p.cuotasMes), color: COLORS.accent }] : []),
                ].map((d, i) => (
                  <div key={i} style={{ background: COLORS.bg, borderRadius: 10, padding: "10px 12px" }}>
                    <div style={{ fontSize: 10, color: COLORS.muted, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>{d.label}</div>
                    <div style={{ fontWeight: 800, color: d.color, fontSize: 14, marginTop: 4, fontFamily: "monospace" }}>{d.value}</div>
                  </div>
                ))}
              </div>
              {pct !== null && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: COLORS.muted, marginBottom: 5 }}>
                    <span>Uso del cupo</span><span>{pct}%</span>
                  </div>
                  <div style={{ height: 6, background: COLORS.border, borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: pct > 80 ? COLORS.danger : pct > 60 ? COLORS.warn : COLORS.accent, borderRadius: 99 }} />
                  </div>
                </div>
              )}
              <div style={{ display: "flex", gap: 14, marginTop: 12 }}>
                {p.fechaCorte && <div style={{ fontSize: 12, color: COLORS.muted }}>Corte: día <strong style={{ color: COLORS.text }}>{p.fechaCorte}</strong></div>}
                {p.fechaPago && <div style={{ fontSize: 12, color: COLORS.muted }}>Pago: día <strong style={{ color: COLORS.text }}>{p.fechaPago}</strong></div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const Gastos = () => (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ margin: 0, color: COLORS.text, fontSize: 20, fontWeight: 800 }}>Gastos</h2>
        <Btn onClick={openNewGasto}><Icon name="plus" size={15} /> Registrar</Btn>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {gastos.length === 0 && <div style={{ color: COLORS.muted, textAlign: "center", padding: 40 }}>Sin gastos registrados</div>}
        {[...gastos].reverse().map(g => {
          const prod = getProd(g.productoId);
          return (
            <div key={g.id} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, color: COLORS.text, fontSize: 15 }}>{g.descripcion}</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                    <Badge color={COLORS.muted}>{g.categoria}</Badge>
                    {prod && <Badge color={COLORS.accent}>{prod.nombre}</Badge>}
                    {g.cuotas > 1 && <Badge color={COLORS.warn}>{g.cuotas} cuotas</Badge>}
                  </div>
                  {g.fecha && <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 6 }}>{g.fecha}</div>}
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                  <div style={{ fontWeight: 800, color: COLORS.warn, fontFamily: "monospace", fontSize: 16 }}>{formatCOP(g.monto)}</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <Btn variant="ghost" onClick={() => openEditGasto(g)} style={{ padding: "5px 8px" }}><Icon name="edit" size={13} /></Btn>
                    <Btn variant="danger" onClick={() => deleteGasto(g.id)} style={{ padding: "5px 8px" }}><Icon name="trash" size={13} /></Btn>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const Simulador = () => {
    const [sim, setSim] = useState({ productoId: productos[0]?.id || "", nuevasCuotas: "", nuevaMensual: "" });
    const prod = getProd(sim.productoId);
    const saldo = Number(prod?.saldo || 0);
    const tasa = Number(prod?.tasaMensual || 0) / 100;

    const calcCuota = (s, t, n) => {
      if (!s || !t || !n) return 0;
      return (s * t) / (1 - Math.pow(1 + t, -n));
    };

    const cuotaActual = prod?.cuotasMes || calcCuota(saldo, tasa, prod?.cuotas || 0);
    const cuotaNueva = sim.nuevasCuotas ? calcCuota(saldo, tasa, Number(sim.nuevasCuotas)) : 0;
    const totalActual = cuotaActual * (prod?.cuotas || 0);
    const totalNuevo = cuotaNueva * Number(sim.nuevasCuotas || 0);

    return (
      <div>
        <h2 style={{ margin: "0 0 20px", color: COLORS.text, fontSize: 20, fontWeight: 800 }}>Simulador de Cuotas</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 20 }}>
            <Select label="Selecciona Producto" value={sim.productoId} onChange={e => setSim(s => ({ ...s, productoId: e.target.value }))}>
              {productos.map(p => <option key={p.id} value={p.id}>{p.nombre} — {p.banco}</option>)}
            </Select>
            {prod && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 16 }}>
                {[
                  { label: "Saldo", value: formatCOP(saldo) },
                  { label: "Tasa MV", value: `${prod.tasaMensual}%` },
                  { label: "Cuota actual", value: formatCOP(cuotaActual) },
                ].map((d, i) => (
                  <div key={i} style={{ background: COLORS.bg, borderRadius: 10, padding: "10px 12px" }}>
                    <div style={{ fontSize: 10, color: COLORS.muted, fontWeight: 700, textTransform: "uppercase" }}>{d.label}</div>
                    <div style={{ fontWeight: 800, color: COLORS.text, fontSize: 14, marginTop: 4 }}>{d.value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 20 }}>
            <Input label="Nuevas Cuotas" type="number" placeholder="Ej: 36" value={sim.nuevasCuotas} onChange={e => setSim(s => ({ ...s, nuevasCuotas: e.target.value }))} />
            {cuotaNueva > 0 && (
              <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { label: "Nueva cuota/mes", value: formatCOP(cuotaNueva), color: COLORS.accent },
                  { label: "Diferencia/mes", value: formatCOP(Math.abs(cuotaNueva - cuotaActual)), color: cuotaNueva < cuotaActual ? COLORS.accent : COLORS.danger },
                  { label: "Total a pagar (actual)", value: formatCOP(totalActual), color: COLORS.warn },
                  { label: "Total a pagar (nuevo)", value: formatCOP(totalNuevo), color: cuotaNueva < cuotaActual ? COLORS.warn : COLORS.danger },
                ].map((d, i) => (
                  <div key={i} style={{ background: COLORS.bg, borderRadius: 12, padding: "14px 16px", border: `1px solid ${d.color}33` }}>
                    <div style={{ fontSize: 11, color: COLORS.muted, fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>{d.label}</div>
                    <div style={{ fontWeight: 800, color: d.color, fontSize: 16, fontFamily: "monospace" }}>{d.value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ background: COLORS.accentDim, border: `1px solid ${COLORS.accent}33`, borderRadius: 12, padding: 14 }}>
            <div style={{ display: "flex", gap: 8, color: COLORS.accent, fontSize: 13 }}>
              <Icon name="info" size={15} />
              <span>Aumentar cuotas reduce la cuota mensual pero incrementa el total de intereses pagados. Siempre paga más del mínimo cuando puedas.</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── NAV ────────────────────────────────────────────────────────────────────
  const navItems = [
    { id: "dashboard", label: "Inicio", icon: "dash" },
    { id: "productos", label: "Productos", icon: "card" },
    { id: "gastos", label: "Gastos", icon: "list" },
    { id: "simulador", label: "Simular", icon: "credit" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, fontFamily: "'Outfit', 'Segoe UI', sans-serif", color: COLORS.text }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ background: COLORS.surface, borderBottom: `1px solid ${COLORS.border}`, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 10 }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 20, color: COLORS.accent, letterSpacing: -0.5 }}>FinTrack</div>
          <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 0.5 }}>TUS FINANZAS, BAJO CONTROL</div>
        </div>
        {alertas.length > 0 && (
          <div style={{ background: COLORS.danger, color: "#fff", borderRadius: 99, width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800 }}>
            {alertas.length}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: "20px 16px 100px" }}>
        {tab === "dashboard" && <Dashboard />}
        {tab === "productos" && <Productos />}
        {tab === "gastos" && <Gastos />}
        {tab === "simulador" && <Simulador />}
      </div>

      {/* Bottom Nav */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: COLORS.surface, borderTop: `1px solid ${COLORS.border}`, display: "flex", padding: "8px 0 12px" }}>
        {navItems.map(n => (
          <button key={n.id} onClick={() => setTab(n.id)} style={{
            flex: 1, background: "none", border: "none", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            color: tab === n.id ? COLORS.accent : COLORS.muted, padding: "6px 0", transition: "color 0.2s",
          }}>
            <Icon name={n.icon} size={22} />
            <span style={{ fontSize: 10, fontWeight: tab === n.id ? 800 : 600, letterSpacing: 0.3 }}>{n.label}</span>
          </button>
        ))}
      </div>

      {/* Modal Producto */}
      {modalProd && (
        <Modal title={editProd ? "Editar Producto" : "Nuevo Producto"} onClose={() => setModalProd(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Input label="Nombre" placeholder="Visa Oro" value={formProd.nombre} onChange={e => setFormProd(s => ({ ...s, nombre: e.target.value }))} />
              <Input label="Banco" placeholder="Bancolombia" value={formProd.banco} onChange={e => setFormProd(s => ({ ...s, banco: e.target.value }))} />
            </div>
            <Select label="Tipo" value={formProd.tipo} onChange={e => setFormProd(s => ({ ...s, tipo: e.target.value }))}>
              {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
            </Select>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Input label="Saldo actual ($)" type="number" placeholder="3200000" value={formProd.saldo} onChange={e => setFormProd(s => ({ ...s, saldo: e.target.value }))} />
              <Input label="Tasa mensual (%)" type="number" step="0.1" placeholder="2.2" value={formProd.tasaMensual} onChange={e => setFormProd(s => ({ ...s, tasaMensual: e.target.value }))} />
            </div>
            {formProd.tipo === "Tarjeta de Crédito" && (
              <Input label="Cupo total ($)" type="number" placeholder="8000000" value={formProd.cupoTotal} onChange={e => setFormProd(s => ({ ...s, cupoTotal: e.target.value }))} />
            )}
            {formProd.tipo === "Crédito Libre Inversión" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Input label="N° cuotas totales" type="number" placeholder="48" value={formProd.cuotas} onChange={e => setFormProd(s => ({ ...s, cuotas: e.target.value }))} />
                <Input label="Cuota mensual ($)" type="number" placeholder="350000" value={formProd.cuotasMes} onChange={e => setFormProd(s => ({ ...s, cuotasMes: e.target.value }))} />
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Input label="Día de corte" type="number" min="1" max="31" placeholder="15" value={formProd.fechaCorte} onChange={e => setFormProd(s => ({ ...s, fechaCorte: e.target.value }))} />
              <Input label="Día de pago" type="number" min="1" max="31" placeholder="25" value={formProd.fechaPago} onChange={e => setFormProd(s => ({ ...s, fechaPago: e.target.value }))} />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <Btn onClick={saveProd} style={{ flex: 1, justifyContent: "center" }}><Icon name="check" size={15} /> Guardar</Btn>
              <Btn variant="ghost" onClick={() => setModalProd(false)} style={{ flex: 1, justifyContent: "center" }}>Cancelar</Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Gasto */}
      {modalGasto && (
        <Modal title={editGasto ? "Editar Gasto" : "Nuevo Gasto"} onClose={() => setModalGasto(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Input label="Descripción" placeholder="Mercado, Netflix, Gasolina..." value={formGasto.descripcion} onChange={e => setFormGasto(s => ({ ...s, descripcion: e.target.value }))} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Input label="Monto ($)" type="number" placeholder="120000" value={formGasto.monto} onChange={e => setFormGasto(s => ({ ...s, monto: e.target.value }))} />
              <Input label="N° cuotas" type="number" min="1" placeholder="1" value={formGasto.cuotas} onChange={e => setFormGasto(s => ({ ...s, cuotas: Number(e.target.value) }))} />
            </div>
            <Select label="Producto financiero" value={formGasto.productoId} onChange={e => setFormGasto(s => ({ ...s, productoId: e.target.value }))}>
              <option value="">Selecciona...</option>
              {productos.map(p => <option key={p.id} value={p.id}>{p.nombre} — {p.banco}</option>)}
            </Select>
            <Select label="Categoría" value={formGasto.categoria} onChange={e => setFormGasto(s => ({ ...s, categoria: e.target.value }))}>
              {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Input label="Fecha" type="date" value={formGasto.fecha} onChange={e => setFormGasto(s => ({ ...s, fecha: e.target.value }))} />
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <Btn onClick={saveGasto} style={{ flex: 1, justifyContent: "center" }}><Icon name="check" size={15} /> Guardar</Btn>
              <Btn variant="ghost" onClick={() => setModalGasto(false)} style={{ flex: 1, justifyContent: "center" }}>Cancelar</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
