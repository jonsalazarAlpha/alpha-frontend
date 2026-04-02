import { useState, useEffect } from 'react'
import axios from 'axios'

const API = 'https://alpha-app-production-fb59.up.railway.app'

function App() {
  const [pagina, setPagina] = useState('inicio')
  const [vehiculos, setVehiculos] = useState([])
  const [vehiculosFiltrados, setVehiculosFiltrados] = useState([])
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [tipousuario, setTipousuario] = useState(localStorage.getItem('tipousuario') || '')
  const [nombreUsuario, setNombreUsuario] = useState(localStorage.getItem('nombreUsuario') || '')
  const [mensaje, setMensaje] = useState('')
  const [form, setForm] = useState({})
  const [reservas, setReservas] = useState([])
  const [busqueda, setBusqueda] = useState({ fechaInicio: '', fechaFin: '', tipo: '' })

  useEffect(() => {
    cargarVehiculos()
  }, [])

  useEffect(() => {
    if (pagina === 'panel') cargarReservas()
  }, [pagina])

  const cargarVehiculos = async () => {
    const res = await axios.get(`${API}/vehiculos`)
    setVehiculos(res.data)
    setVehiculosFiltrados(res.data)
  }

  const cargarReservas = async () => {
    try {
      const res = await axios.get(`${API}/propietario/reservas`, { headers: { Authorization: `Bearer ${token}` } })
      setReservas(res.data)
    } catch { setMensaje('Error al cargar reservas') }
  }

  const buscar = () => {
    let resultado = vehiculos
    if (busqueda.tipo) resultado = resultado.filter(v => v.tipo.toLowerCase().includes(busqueda.tipo.toLowerCase()))
    setVehiculosFiltrados(resultado)
    setPagina('vehiculos')
  }

  const login = async () => {
    try {
      const res = await axios.post(`${API}/login/usuario`, { email: form.email, contrasena: form.contrasena })
      setToken(res.data.token); setTipousuario('usuario')
      localStorage.setItem('token', res.data.token); localStorage.setItem('tipousuario', 'usuario')
      setMensaje('Login exitoso'); setPagina('vehiculos')
    } catch { setMensaje('Credenciales incorrectas') }
  }

  const loginPropietario = async () => {
    try {
      const res = await axios.post(`${API}/login/propietario`, { email: form.email, contrasena: form.contrasena })
      setToken(res.data.token); setTipousuario('propietario'); setNombreUsuario(res.data.nombre)
      localStorage.setItem('token', res.data.token); localStorage.setItem('tipousuario', 'propietario'); localStorage.setItem('nombreUsuario', res.data.nombre)
      setMensaje(`Bienvenida ${res.data.nombre}`); setPagina('panel')
    } catch { setMensaje('Credenciales incorrectas') }
  }

  const registro = async () => {
    try {
      await axios.post(`${API}/registro/usuario`, { nombre: form.nombre, email: form.email, contrasena: form.contrasena })
      setMensaje('Registro exitoso, ahora inicia sesion'); setPagina('login')
    } catch { setMensaje('Error al registrarse') }
  }

  const reservar = async () => {
    try {
      const res = await axios.post(`${API}/reservas`, { vehiculo_id: form.vehiculo_id, fecha_inicio: form.fecha_inicio, fecha_fin: form.fecha_fin }, { headers: { Authorization: `Bearer ${token}` } })
      setMensaje(`Reserva creada! Total: $${res.data.precio_total} | Plataforma: $${res.data.comision_plataforma} | Propietario recibe: $${res.data.propietario_recibe}`)
      setPagina('vehiculos')
    } catch { setMensaje('Error al reservar. Minimo 3 dias.') }
  }

  const actualizarEstado = async (id, estado) => {
    try {
      await axios.put(`${API}/reservas/${id}/estado`, { estado }, { headers: { Authorization: `Bearer ${token}` } })
      setMensaje(`Reserva ${estado}`); cargarReservas()
    } catch { setMensaje('Error al actualizar') }
  }

  const cerrarSesion = () => { setToken(''); setTipousuario(''); setNombreUsuario(''); localStorage.clear(); setPagina('inicio') }
  const inp = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  return (
    <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", minHeight: '100vh', background: '#f8f9fa' }}>

      {/* NAVBAR */}
      <nav style={{ background: 'white', padding: '0 40px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 100 }}>
        <h1 onClick={() => setPagina('inicio')} style={{ color: '#e74c3c', margin: 0, fontSize: 28, fontWeight: 800, cursor: 'pointer', letterSpacing: -1 }}>ALPHA</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {token ? (
            <>
              {tipousuario === 'usuario' && <button onClick={() => setPagina('vehiculos')} style={navBtn}>Vehiculos</button>}
              {tipousuario === 'propietario' && <button onClick={() => setPagina('panel')} style={navBtn}>Mi panel</button>}
              <button onClick={cerrarSesion} style={{ ...navBtn, background: '#e74c3c', color: 'white', border: 'none' }}>Salir</button>
            </>
          ) : (
            <>
              <button onClick={() => setPagina('login')} style={navBtn}>Iniciar sesion</button>
              <button onClick={() => setPagina('login_propietario')} style={{ ...navBtn, background: '#e74c3c', color: 'white', border: 'none' }}>Soy propietario</button>
              <button onClick={() => setPagina('registro')} style={{ ...navBtn, background: '#2c3e50', color: 'white', border: 'none' }}>Registrarse</button>
            </>
          )}
        </div>
      </nav>

      {mensaje && <div style={{ background: '#d4edda', padding: '12px 40px', color: '#155724', fontSize: 14 }}>{mensaje} <span onClick={() => setMensaje('')} style={{ float: 'right', cursor: 'pointer' }}>x</span></div>}

      {/* HERO */}
      {pagina === 'inicio' && (
        <div>
          <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', padding: '80px 40px', textAlign: 'center', color: 'white' }}>
            <h2 style={{ fontSize: 42, fontWeight: 800, margin: '0 0 12px', lineHeight: 1.2 }}>Alquila el vehiculo perfecto<br/>en El Salvador</h2>
            <p style={{ fontSize: 18, opacity: 0.8, margin: '0 0 40px' }}>Miles de opciones · Precios transparentes · Sin sorpresas</p>

            {/* BUSCADOR */}
            <div style={{ background: 'white', borderRadius: 16, padding: '24px 28px', maxWidth: 780, margin: '0 auto', display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label style={{ display: 'block', fontSize: 12, color: '#666', fontWeight: 600, marginBottom: 6, textAlign: 'left' }}>TIPO DE VEHICULO</label>
                <select onChange={e => setBusqueda({...busqueda, tipo: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #ddd', borderRadius: 8, fontSize: 14, color: '#333' }}>
                  <option value="">Todos los tipos</option>
                  <option value="Sedan">Sedan</option>
                  <option value="Pickup">Pick-up</option>
                  <option value="Microbus">Microbus</option>
                  <option value="Camioneta">Camioneta</option>
                </select>
              </div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label style={{ display: 'block', fontSize: 12, color: '#666', fontWeight: 600, marginBottom: 6, textAlign: 'left' }}>FECHA INICIO</label>
                <input type="date" onChange={e => setBusqueda({...busqueda, fechaInicio: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }} />
              </div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label style={{ display: 'block', fontSize: 12, color: '#666', fontWeight: 600, marginBottom: 6, textAlign: 'left' }}>FECHA FIN</label>
                <input type="date" onChange={e => setBusqueda({...busqueda, fechaFin: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }} />
              </div>
              <button onClick={buscar} style={{ background: '#e74c3c', color: 'white', border: 'none', borderRadius: 8, padding: '11px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>Buscar</button>
            </div>
          </div>

          {/* CATEGORIAS */}
          <div style={{ padding: '48px 40px', maxWidth: 1100, margin: '0 auto' }}>
            <h3 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 24px', color: '#1a1a2e' }}>Explora por categoria</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
              {[{tipo:'Sedan',emoji:'🚗',desc:'Comodo y economico'},{tipo:'Pick-up',emoji:'🛻',desc:'Para trabajo y aventura'},{tipo:'Microbus',emoji:'🚌',desc:'Grupos y familias'},{tipo:'Camioneta',emoji:'🚙',desc:'Espacioso y versatil'}].map(c => (
                <div key={c.tipo} onClick={() => { setBusqueda({...busqueda, tipo: c.tipo}); buscar(); }} style={{ background: 'white', borderRadius: 12, padding: '24px 20px', textAlign: 'center', cursor: 'pointer', border: '1.5px solid #eee', transition: 'all 0.2s' }}
                  onMouseOver={e => e.currentTarget.style.borderColor='#e74c3c'}
                  onMouseOut={e => e.currentTarget.style.borderColor='#eee'}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>{c.emoji}</div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: '#1a1a2e' }}>{c.tipo}</div>
                  <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>{c.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* VEHICULOS DESTACADOS */}
          <div style={{ padding: '0 40px 48px', maxWidth: 1100, margin: '0 auto' }}>
            <h3 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 24px', color: '#1a1a2e' }}>Vehiculos disponibles</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {vehiculos.map(v => (
                <div key={v.id} style={{ background: 'white', borderRadius: 12, overflow: 'hidden', border: '1px solid #eee', transition: 'box-shadow 0.2s' }}
                  onMouseOver={e => e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.12)'}
                  onMouseOut={e => e.currentTarget.style.boxShadow='none'}>
                  {v.foto_url ? <img src={v.foto_url} alt={v.modelo} style={{ width: '100%', height: 180, objectFit: 'cover' }} /> : <div style={{ height: 180, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>🚗</div>}
                  <div style={{ padding: 16 }}>
                    <h4 style={{ margin: '0 0 6px', color: '#1a1a2e', fontSize: 17 }}>{v.marca} {v.modelo}</h4>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                      <span style={tag}>{v.tipo}</span>
                      <span style={tag}>{v.año}</span>
                      <span style={tag}>Cat. {v.categoria}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div><span style={{ fontSize: 22, fontWeight: 800, color: '#e74c3c' }}>${v.precio_por_dia}</span><span style={{ fontSize: 13, color: '#888' }}>/dia</span></div>
                      <button onClick={() => { if(!token){ setPagina('login'); return; } setForm({ vehiculo_id: v.id, precio: v.precio_por_dia }); setPagina('reservar') }} style={{ background: '#e74c3c', color: 'white', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>Reservar</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FOOTER */}
          <footer style={{ background: '#1a1a2e', color: 'white', padding: '40px', textAlign: 'center' }}>
            <h3 style={{ color: '#e74c3c', margin: '0 0 8px', fontSize: 24 }}>ALPHA</h3>
            <p style={{ opacity: 0.6, margin: '0 0 16px', fontSize: 14 }}>Plataforma de alquiler de vehiculos en El Salvador</p>
            <p style={{ opacity: 0.4, fontSize: 12 }}>© 2026 Alpha. Todos los derechos reservados.</p>
          </footer>
        </div>
      )}

      {/* VEHICULOS */}
      {pagina === 'vehiculos' && (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 40px' }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, margin: '0 0 24px', color: '#1a1a2e' }}>Vehiculos disponibles</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {vehiculosFiltrados.map(v => (
              <div key={v.id} style={{ background: 'white', borderRadius: 12, overflow: 'hidden', border: '1px solid #eee' }}>
                {v.foto_url ? <img src={v.foto_url} alt={v.modelo} style={{ width: '100%', height: 180, objectFit: 'cover' }} /> : <div style={{ height: 180, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>🚗</div>}
                <div style={{ padding: 16 }}>
                  <h4 style={{ margin: '0 0 6px', color: '#1a1a2e', fontSize: 17 }}>{v.marca} {v.modelo}</h4>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                    <span style={tag}>{v.tipo}</span><span style={tag}>{v.año}</span><span style={tag}>Cat. {v.categoria}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div><span style={{ fontSize: 22, fontWeight: 800, color: '#e74c3c' }}>${v.precio_por_dia}</span><span style={{ fontSize: 13, color: '#888' }}>/dia</span></div>
                    <button onClick={() => { if(!token){ setPagina('login'); return; } setForm({ vehiculo_id: v.id, precio: v.precio_por_dia }); setPagina('reservar') }} style={{ background: '#e74c3c', color: 'white', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 700, cursor: 'pointer' }}>Reservar</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LOGIN */}
      {pagina === 'login' && (
        <div style={{ maxWidth: 420, margin: '60px auto', background: 'white', borderRadius: 16, padding: 36, boxShadow: '0 4px 24px rgba(0,0,0,0.10)' }}>
          <h2 style={{ margin: '0 0 24px', color: '#1a1a2e', fontSize: 24 }}>Iniciar sesion</h2>
          <input name="email" placeholder="Email" onChange={inp} style={inputStyle} />
          <input name="contrasena" type="password" placeholder="Contrasena" onChange={inp} style={inputStyle} />
          <button onClick={login} style={primaryBtn}>Entrar</button>
          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: '#666' }}>No tienes cuenta? <span onClick={() => setPagina('registro')} style={{ color: '#e74c3c', cursor: 'pointer', fontWeight: 600 }}>Registrate</span></p>
        </div>
      )}

      {/* LOGIN PROPIETARIO */}
      {pagina === 'login_propietario' && (
        <div style={{ maxWidth: 420, margin: '60px auto', background: 'white', borderRadius: 16, padding: 36, boxShadow: '0 4px 24px rgba(0,0,0,0.10)' }}>
          <h2 style={{ margin: '0 0 24px', color: '#1a1a2e', fontSize: 24 }}>Panel de propietario</h2>
          <input name="email" placeholder="Email" onChange={inp} style={inputStyle} />
          <input name="contrasena" type="password" placeholder="Contrasena" onChange={inp} style={inputStyle} />
          <button onClick={loginPropietario} style={primaryBtn}>Entrar como propietario</button>
        </div>
      )}

      {/* REGISTRO */}
      {pagina === 'registro' && (
        <div style={{ maxWidth: 420, margin: '60px auto', background: 'white', borderRadius: 16, padding: 36, boxShadow: '0 4px 24px rgba(0,0,0,0.10)' }}>
          <h2 style={{ margin: '0 0 24px', color: '#1a1a2e', fontSize: 24 }}>Crear cuenta</h2>
          <input name="nombre" placeholder="Nombre completo" onChange={inp} style={inputStyle} />
          <input name="email" placeholder="Email" onChange={inp} style={inputStyle} />
          <input name="contrasena" type="password" placeholder="Contrasena" onChange={inp} style={inputStyle} />
          <button onClick={registro} style={primaryBtn}>Crear cuenta</button>
        </div>
      )}

      {/* RESERVAR */}
      {pagina === 'reservar' && (
        <div style={{ maxWidth: 480, margin: '60px auto', background: 'white', borderRadius: 16, padding: 36, boxShadow: '0 4px 24px rgba(0,0,0,0.10)' }}>
          <h2 style={{ margin: '0 0 6px', color: '#1a1a2e' }}>Confirmar reserva</h2>
          <p style={{ color: '#888', fontSize: 14, marginBottom: 24 }}>Minimo 3 dias de alquiler</p>
          <div style={{ background: '#fff8f8', border: '1.5px solid #fde', borderRadius: 10, padding: '16px 20px', marginBottom: 20 }}>
            <p style={{ margin: 0, fontWeight: 700, color: '#1a1a2e' }}>Precio por dia: <span style={{ color: '#e74c3c' }}>${form.precio}</span></p>
          </div>
          <label style={labelStyle}>Fecha de inicio</label>
          <input name="fecha_inicio" type="date" onChange={inp} style={inputStyle} />
          <label style={labelStyle}>Fecha de fin</label>
          <input name="fecha_fin" type="date" onChange={inp} style={inputStyle} />
          <button onClick={reservar} style={primaryBtn}>Confirmar reserva</button>
          <button onClick={() => setPagina('vehiculos')} style={{ ...primaryBtn, background: 'white', color: '#666', border: '1.5px solid #ddd', marginTop: 8 }}>Cancelar</button>
        </div>
      )}

      {/* PANEL PROPIETARIO */}
      {pagina === 'panel' && (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 40px' }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: '#1a1a2e', margin: '0 0 6px' }}>Panel de {nombreUsuario}</h2>
          <p style={{ color: '#888', marginBottom: 24 }}>Gestiona las reservas de tus vehiculos</p>
          {reservas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#aaa' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
              <p>No hay reservas aun</p>
            </div>
          ) : reservas.map(r => (
            <div key={r.id} style={{ background: 'white', borderRadius: 12, padding: 20, marginBottom: 12, border: '1px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <h3 style={{ margin: 0, color: '#1a1a2e' }}>{r.vehiculo}</h3>
                <span style={{ padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: r.estado==='aprobada'?'#d4edda':r.estado==='rechazada'?'#fde':' #fff3cd', color: r.estado==='aprobada'?'#155724':r.estado==='rechazada'?'#e74c3c':'#856404' }}>{r.estado}</span>
              </div>
              <p style={{ margin: '4px 0', color: '#666', fontSize: 14 }}>Cliente: <strong>{r.usuario}</strong></p>
              <p style={{ margin: '4px 0', color: '#666', fontSize: 14 }}>Fechas: {r.fecha_inicio} al {r.fecha_fin}</p>
              <p style={{ margin: '8px 0 0', fontSize: 15 }}>Total: <strong>${r.precio_total}</strong> | Tu recibes: <strong style={{ color: '#27ae60' }}>${r.propietario_recibe}</strong></p>
              {r.estado === 'pendiente' && (
                <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                  <button onClick={() => actualizarEstado(r.id, 'aprobada')} style={{ flex: 1, background: '#27ae60', color: 'white', border: 'none', borderRadius: 8, padding: '10px', fontWeight: 700, cursor: 'pointer' }}>Aprobar</button>
                  <button onClick={() => actualizarEstado(r.id, 'rechazada')} style={{ flex: 1, background: '#e74c3c', color: 'white', border: 'none', borderRadius: 8, padding: '10px', fontWeight: 700, cursor: 'pointer' }}>Rechazar</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const navBtn = { padding: '8px 18px', borderRadius: 8, border: '1.5px solid #ddd', cursor: 'pointer', background: 'white', fontSize: 14, fontWeight: 500 }
const tag = { background: '#f0f0f0', color: '#555', fontSize: 12, padding: '3px 8px', borderRadius: 20 }
const inputStyle = { width: '100%', padding: '12px 14px', margin: '8px 0', border: '1.5px solid #ddd', borderRadius: 10, fontSize: 15, boxSizing: 'border-box', display: 'block' }
const primaryBtn = { width: '100%', padding: '13px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: 'pointer', marginTop: 8, display: 'block' }
const labelStyle = { fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginTop: 12 }

export default App