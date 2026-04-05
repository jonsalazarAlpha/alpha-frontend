import { useState, useEffect } from 'react'
import axios from 'axios'
import { Car, MapPin, CheckCircle, DollarSign, Key } from 'lucide-react'

const API = 'https://alpha-app-production-fb59.up.railway.app'

const ZONAS = {
  'Zona Occidental': ['Ahuachapán', 'Santa Ana', 'Sonsonate'],
  'Zona Central': ['Chalatenango', 'La Libertad', 'San Salvador', 'Cuscatlán', 'La Paz'],
  'Zona Paracentral': ['Cabañas', 'San Vicente'],
  'Zona Oriental': ['Usulután', 'San Miguel', 'Morazán', 'La Unión']
}

const INFO_DEPTOS = {
  'Ahuachapán': 'Conocido por sus recursos geotérmicos y producción agrícola.',
  'Santa Ana': 'Destaca por el volcán de Santa Ana y su actividad comercial.',
  'Sonsonate': 'Famoso por su cercanía a playas turísticas y producción de café.',
  'Chalatenango': 'Región montañosa con clima fresco y riqueza natural.',
  'La Libertad': 'Importante por sus playas y el turismo de surf.',
  'San Salvador': 'Capital del país y centro político, económico y cultural.',
  'Cuscatlán': 'Departamento pequeño con tradición agrícola y cultural.',
  'La Paz': 'Zona agrícola y costera.',
  'Cabañas': 'Destaca por sus artesanías, especialmente en Ilobasco.',
  'San Vicente': 'Conocido por el volcán Chinchontepec y su historia.',
  'Usulután': 'Importante por la Bahía de Jiquilisco y su biodiversidad.',
  'San Miguel': 'Centro económico del oriente, con el volcán Chaparrastique.',
  'Morazán': 'Rico en historia y tradiciones culturales.',
  'La Unión': 'Destaca por su puerto y acceso al Golfo de Fonseca.'
}

const CATEGORIAS = [
  { tipo: 'Sedan', label: 'Sedán', img: 'https://images.unsplash.com/photo-1592805723127-004b174a1798?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', desc: 'Cómodo y económico' },
  { tipo: 'Pickup', label: 'Pick-up', img: 'https://images.unsplash.com/photo-1588814928518-238716568ef4?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', desc: 'Para trabajo y aventura' },
  { tipo: 'Microbus', label: 'Microbús', img: 'https://images.unsplash.com/photo-1775053392841-7fa6dabdb760?q=80&w=1031&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', desc: 'Para grupos y familias' },
  { tipo: 'Camioneta', label: 'Camioneta', img: 'https://images.unsplash.com/photo-1575090536203-2a6193126514?q=80&w=871&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', desc: 'Espaciosa y versátil' },
]

const CONSEJOS_ANTES = [
  { icon: '📍', texto: 'Verifica la ubicación en Google Maps' },
  { icon: '🪪', texto: 'Lleva tu licencia y documento' },
  { icon: '💳', texto: 'Usa tarjeta de crédito (depósito requerido)' },
  { icon: '⏰', texto: 'Llega puntual' },
]

const CONSEJOS_AL_RECIBIR = [
  { icon: '🔍', texto: 'Revisa el vehículo y toma fotos' },
  { icon: '⛽', texto: 'Confirma el nivel de combustible' },
]

function calcularPrecios(precioBase) {
  const comision = precioBase * 0.15
  const subtotal = precioBase + comision
  const iva = subtotal * 0.13
  const total = subtotal + iva
  return { comision, iva, total }
}

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
  const [zonaSeleccionada, setZonaSeleccionada] = useState('')
  const [tipoCuenta, setTipoCuenta] = useState('')
  const [precioBase, setPrecioBase] = useState(0)
  const [fotosPropietario, setFotosPropietario] = useState({})
  const [zonaVehiculo, setZonaVehiculo] = useState('')

  useEffect(() => { cargarVehiculos() }, [])
  useEffect(() => { if (pagina === 'panel') cargarReservas() }, [pagina])

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
      setMensaje(`Bienvenido/a ${res.data.nombre}`); setPagina('panel')
    } catch { setMensaje('Credenciales incorrectas') }
  }

  const registroCliente = async () => {
    try {
      await axios.post(`${API}/registro/usuario`, {
        nombre: form.nombre, email: form.email, contrasena: form.contrasena,
        tipo_documento: form.tipo_documento, numero_documento: form.numero_documento,
        tipo_cuenta: 'cliente'
      })
      setMensaje('¡Registro exitoso! Ahora inicia sesión'); setPagina('login')
    } catch { setMensaje('Error al registrarse. El email ya existe.') }
  }

  const registroPropietario = async () => {
    try {
      const propRes = await axios.post(`${API}/registro/propietario`, {
        nombre: form.nombre, email: form.email, contrasena: form.contrasena
      })
      const propId = propRes.data.id
      const loginRes = await axios.post(`${API}/login/propietario`, { email: form.email, contrasena: form.contrasena })
      const tkn = loginRes.data.token
      const { total } = calcularPrecios(precioBase)
      const vehiculoRes = await axios.post(`${API}/vehiculos`, {
        propietario_id: propId, marca: form.marca, modelo: form.modelo,
        ano: parseInt(form.ano), tipo: form.tipo_vehiculo, categoria: 'C',
        precio_por_dia: total, descripcion: '',
        transmision: form.transmision, combustible: form.combustible,
        color: form.color, placa: form.placa,
        zona: zonaVehiculo, departamento: form.departamento, seguro: 'Si'
      }, { headers: { Authorization: `Bearer ${tkn}` } })
      const vehiculoId = vehiculoRes.data.id
      for (const [key, file] of Object.entries(fotosPropietario)) {
        if (file) {
          const formData = new FormData()
          formData.append('foto', file)
          await axios.post(`${API}/vehiculos/${vehiculoId}/foto`, formData, { headers: { Authorization: `Bearer ${tkn}` } })
        }
      }
      setMensaje('¡Vehículo registrado con éxito! Ya puedes iniciar sesión.')
      setPagina('login_propietario')
    } catch { setMensaje('Error al registrar. Verifica los datos.') }
  }

  const reservar = async () => {
    try {
      const res = await axios.post(`${API}/reservas`, {
        vehiculo_id: form.vehiculo_id, fecha_inicio: form.fecha_inicio, fecha_fin: form.fecha_fin
      }, { headers: { Authorization: `Bearer ${token}` } })
      setMensaje(`¡Reserva creada! Total: $${res.data.precio_total}`)
      setPagina('vehiculos')
    } catch { setMensaje('Error al reservar. Mínimo 3 días.') }
  }

  const actualizarEstado = async (id, estado) => {
    try {
      await axios.put(`${API}/reservas/${id}/estado`, { estado }, { headers: { Authorization: `Bearer ${token}` } })
      setMensaje(`Reserva ${estado}`); cargarReservas()
    } catch { setMensaje('Error al actualizar') }
  }

  const cerrarSesion = () => { setToken(''); setTipousuario(''); setNombreUsuario(''); localStorage.clear(); setPagina('inicio') }
  const inp = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const TarjetaVehiculo = ({ v, onReservar }) => {
    const { comision, iva, total } = calcularPrecios(v.precio_por_dia)
    return (
      <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden', border: '1px solid #eee', transition: 'box-shadow 0.2s' }}
        onMouseOver={e => e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.10)'}
        onMouseOut={e => e.currentTarget.style.boxShadow='none'}>
        {v.foto_url ? <img src={v.foto_url} alt={v.modelo} style={{ width: '100%', height: 180, objectFit: 'cover' }} /> : <div style={{ height: 180, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Car size={64} color="#ccc" /></div>}
        <div style={{ padding: 16 }}>
          <h4 style={{ margin: '0 0 6px', color: '#1a1a2e', fontSize: 17 }}>{v.marca} {v.modelo}</h4>
          <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
            <span style={tag}>{v.tipo}</span>
            <span style={tag}>{v.año}</span>
            {v.transmision && <span style={tag}>{v.transmision}</span>}
            {v.combustible && <span style={tag}>{v.combustible}</span>}
            {v.color && <span style={tag}>{v.color}</span>}
            {v.departamento && <span style={{ ...tag, display: 'inline-flex', alignItems: 'center', gap: 3 }}><MapPin size={10} />{v.departamento}</span>}
          </div>
          {v.seguro && <p style={{ margin: '4px 0 8px', fontSize: 12, color: '#27ae60', display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle size={12} />Con seguro incluido</p>}
          <div style={{ background: '#f8f9fa', borderRadius: 8, padding: '10px 12px', margin: '8px 0', fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', marginBottom: 3 }}><span>Precio base:</span><span>${v.precio_por_dia}/día</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', marginBottom: 3 }}><span>Comisión 15%:</span><span>+${comision.toFixed(2)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', marginBottom: 3 }}><span>IVA 13%:</span><span>+${iva.toFixed(2)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#e74c3c', borderTop: '1px solid #ddd', paddingTop: 6, marginTop: 4 }}><span>Total/día:</span><span>${total.toFixed(2)}</span></div>
          </div>
          <button onClick={onReservar} style={{ background: '#e74c3c', color: 'white', border: 'none', borderRadius: 8, padding: '10px', width: '100%', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>Reservar</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", minHeight: '100vh', background: '#f8f9fa' }}>

      <nav style={{ background: 'white', padding: '0 40px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 100 }}>
        <h1 onClick={() => setPagina('inicio')} style={{ color: '#e74c3c', margin: 0, fontSize: 28, fontWeight: 800, cursor: 'pointer' }}>ALPHA</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {token ? (
            <>
              {tipousuario === 'usuario' && <button onClick={() => setPagina('vehiculos')} style={navBtn}>Vehículos</button>}
              {tipousuario === 'propietario' && <button onClick={() => setPagina('panel')} style={navBtn}>Mi panel</button>}
              <button onClick={cerrarSesion} style={{ ...navBtn, background: '#e74c3c', color: 'white', border: 'none' }}>Salir</button>
            </>
          ) : (
            <>
              <button onClick={() => setPagina('login')} style={navBtn}>Iniciar sesión</button>
              <button onClick={() => { setTipoCuenta(''); setPagina('registro') }} style={{ ...navBtn, background: '#e74c3c', color: 'white', border: 'none' }}>Registrarse</button>
            </>
          )}
        </div>
      </nav>

      {mensaje && <div style={{ background: '#d4edda', padding: '12px 40px', color: '#155724', fontSize: 14 }}>{mensaje} <span onClick={() => setMensaje('')} style={{ float: 'right', cursor: 'pointer' }}>✕</span></div>}

      {pagina === 'inicio' && (
        <div>
          {/* HERO */}
          <div style={{ background: 'linear-gradient(135deg, #e8e8f0 0%, #16213e 50%, #0f3460 100%)', padding: '80px 40px', textAlign: 'center', color: 'white' }}>
            <h2 style={{ fontSize: 42, fontWeight: 800, margin: '0 0 12px', lineHeight: 1.2 }}>Alquila el vehículo perfecto<br/>en El Salvador</h2>
            <p style={{ fontSize: 18, opacity: 0.8, margin: '0 0 40px' }}>Miles de opciones · Precios transparentes · Sin sorpresas</p>
            <div style={{ background: 'white', borderRadius: 16, padding: '24px 28px', maxWidth: 780, margin: '0 auto', display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label style={searchLabel}>TIPO DE VEHÍCULO</label>
                <select onChange={e => setBusqueda({...busqueda, tipo: e.target.value})} style={searchInput}>
                  <option value="">Todos los tipos</option>
                  <option value="Sedan">Sedán</option>
                  <option value="Pickup">Pick-up</option>
                  <option value="Microbus">Microbús</option>
                  <option value="Camioneta">Camioneta</option>
                </select>
              </div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label style={searchLabel}>FECHA DE INICIO</label>
                <input type="date" onChange={e => setBusqueda({...busqueda, fechaInicio: e.target.value})} style={searchInput} />
              </div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label style={searchLabel}>FECHA DE FIN</label>
                <input type="date" onChange={e => setBusqueda({...busqueda, fechaFin: e.target.value})} style={searchInput} />
              </div>
              <button onClick={buscar} style={{ background: '#e74c3c', color: 'white', border: 'none', borderRadius: 8, padding: '11px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>Buscar</button>
            </div>
          </div>

          {/* CATEGORIAS CON FOTOS REALES */}
          <div style={{ padding: '48px 40px', maxWidth: 1100, margin: '0 auto' }}>
            <h3 style={sectionTitle}>Explora por categoría</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
              {CATEGORIAS.map(c => (
                <div key={c.tipo} onClick={() => { setBusqueda({...busqueda, tipo: c.tipo}); buscar() }} style={{ borderRadius: 12, overflow: 'hidden', cursor: 'pointer', border: '2px solid transparent', transition: 'all 0.2s', position: 'relative' }}
                  onMouseOver={e => { e.currentTarget.style.borderColor='#e74c3c'; e.currentTarget.style.transform='translateY(-3px)' }}
                  onMouseOut={e => { e.currentTarget.style.borderColor='transparent'; e.currentTarget.style.transform='translateY(0)' }}>
                  <img src={c.img} alt={c.label} style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
                  <div style={{ background: 'white', padding: '14px 16px', borderTop: '1px solid #eee' }}>
                    <div style={{ fontWeight: 700, fontSize: 16, color: '#1a1a2e' }}>{c.label}</div>
                    <div style={{ fontSize: 13, color: '#888', marginTop: 3 }}>{c.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* VEHICULOS DISPONIBLES */}
          <div style={{ padding: '0 40px 48px', maxWidth: 1100, margin: '0 auto' }}>
            <h3 style={sectionTitle}>Vehículos disponibles</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {vehiculos.map(v => (
                <TarjetaVehiculo key={v.id} v={v} onReservar={() => { if(!token){ setPagina('login'); return; } setForm({ vehiculo_id: v.id, precio: v.precio_por_dia }); setPagina('reservar') }} />
              ))}
            </div>
          </div>

          {/* CONSEJOS */}
          <div style={{ background: '#fff', padding: '60px 40px' }}>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
              <h3 style={{ ...sectionTitle, textAlign: 'center' }}>Antes de recibir tu vehículo:</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div style={{ background: '#f8f9fa', borderRadius: 16, padding: 28, border: '1.5px solid #eee' }}>
                  <h4 style={{ margin: '0 0 20px', color: '#1a1a2e', fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ background: '#e74c3c', color: 'white', borderRadius: '50%', width: 28, height: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>1</span>
                    Antes de recibir tu vehículo
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {CONSEJOS_ANTES.map((c, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: 'white', padding: '12px 16px', borderRadius: 10, border: '1px solid #eee' }}>
                        <span style={{ fontSize: 22, flexShrink: 0 }}>{c.icon}</span>
                        <span style={{ fontSize: 14, color: '#444', lineHeight: 1.5 }}>{c.texto}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ background: '#f8f9fa', borderRadius: 16, padding: 28, border: '1.5px solid #eee' }}>
                  <h4 style={{ margin: '0 0 20px', color: '#1a1a2e', fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ background: '#e74c3c', color: 'white', borderRadius: '50%', width: 28, height: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>2</span>
                    Al recibir el vehículo
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {CONSEJOS_AL_RECIBIR.map((c, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: 'white', padding: '12px 16px', borderRadius: 10, border: '1px solid #eee' }}>
                        <span style={{ fontSize: 22, flexShrink: 0 }}>{c.icon}</span>
                        <span style={{ fontSize: 14, color: '#444', lineHeight: 1.5 }}>{c.texto}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ZONAS */}
          <div style={{ background: '#1a1a2e', padding: '60px 40px', color: 'white' }}>
            <h3 style={{ fontSize: 28, fontWeight: 800, textAlign: 'center', margin: '0 0 8px', color: 'white' }}>Estamos disponibles en todo El Salvador</h3>
            <p style={{ textAlign: 'center', opacity: 0.7, marginBottom: 40 }}>Selecciona tu zona para ver los departamentos</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 32 }}>
              {Object.keys(ZONAS).map(zona => (
                <button key={zona} onClick={() => setZonaSeleccionada(zonaSeleccionada === zona ? '' : zona)} style={{ padding: '10px 20px', borderRadius: 30, border: '2px solid', borderColor: zonaSeleccionada === zona ? '#e74c3c' : 'rgba(255,255,255,0.3)', background: zonaSeleccionada === zona ? '#e74c3c' : 'transparent', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>{zona}</button>
              ))}
            </div>
            {zonaSeleccionada && (
              <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                {ZONAS[zonaSeleccionada].map(depto => (
                  <div key={depto} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '20px 16px', border: '1px solid rgba(255,255,255,0.15)' }}>
                    <h4 style={{ margin: '0 0 8px', color: '#e74c3c', fontSize: 16, display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={14} />{depto}</h4>
                    <p style={{ margin: 0, fontSize: 13, opacity: 0.8, lineHeight: 1.5 }}>{INFO_DEPTOS[depto]}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <footer style={{ background: '#0d0d1a', color: 'white', padding: '40px', textAlign: 'center' }}>
            <h3 style={{ color: '#e74c3c', margin: '0 0 8px', fontSize: 24 }}>ALPHA</h3>
            <p style={{ opacity: 0.6, margin: '0 0 16px', fontSize: 14 }}>Plataforma de alquiler de vehículos en El Salvador</p>
            <p style={{ opacity: 0.4, fontSize: 12 }}>© 2026 Alpha. Todos los derechos reservados.</p>
          </footer>
        </div>
      )}

      {pagina === 'vehiculos' && (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 40px' }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, margin: '0 0 24px', color: '#1a1a2e' }}>Vehículos disponibles</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {vehiculosFiltrados.map(v => (
              <TarjetaVehiculo key={v.id} v={v} onReservar={() => { if(!token){ setPagina('login'); return; } setForm({ vehiculo_id: v.id, precio: v.precio_por_dia }); setPagina('reservar') }} />
            ))}
          </div>
        </div>
      )}

      {pagina === 'login' && (
        <div style={{ maxWidth: 420, margin: '60px auto', background: 'white', borderRadius: 16, padding: 36, boxShadow: '0 4px 24px rgba(0,0,0,0.10)' }}>
          <h2 style={{ margin: '0 0 24px', color: '#1a1a2e' }}>Iniciar sesión</h2>
          <input name="email" placeholder="Correo electrónico" onChange={inp} style={inputStyle} />
          <input name="contrasena" type="password" placeholder="Contraseña" onChange={inp} style={inputStyle} />
          <button onClick={login} style={primaryBtn}>Entrar</button>
          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: '#666' }}>¿No tienes cuenta? <span onClick={() => { setTipoCuenta(''); setPagina('registro') }} style={{ color: '#e74c3c', cursor: 'pointer', fontWeight: 600 }}>Regístrate</span></p>
        </div>
      )}

      {pagina === 'login_propietario' && (
        <div style={{ maxWidth: 420, margin: '60px auto', background: 'white', borderRadius: 16, padding: 36, boxShadow: '0 4px 24px rgba(0,0,0,0.10)' }}>
          <h2 style={{ margin: '0 0 24px', color: '#1a1a2e' }}>Acceso propietarios</h2>
          <input name="email" placeholder="Correo electrónico" onChange={inp} style={inputStyle} />
          <input name="contrasena" type="password" placeholder="Contraseña" onChange={inp} style={inputStyle} />
          <button onClick={loginPropietario} style={primaryBtn}>Entrar como propietario</button>
        </div>
      )}

      {pagina === 'registro' && !tipoCuenta && (
        <div style={{ maxWidth: 640, margin: '60px auto', padding: '0 20px' }}>
          <h2 style={{ textAlign: 'center', color: '#1a1a2e', marginBottom: 8 }}>¡Bienvenido a Alpha!</h2>
          <p style={{ textAlign: 'center', color: '#888', marginBottom: 32 }}>Elige una opción para continuar</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div onClick={() => setTipoCuenta('cliente')} style={{ background: 'white', borderRadius: 16, padding: 32, textAlign: 'center', cursor: 'pointer', border: '2px solid #eee', transition: 'all 0.2s' }}
              onMouseOver={e => { e.currentTarget.style.borderColor='#e74c3c'; e.currentTarget.style.transform='translateY(-2px)' }}
              onMouseOut={e => { e.currentTarget.style.borderColor='#eee'; e.currentTarget.style.transform='translateY(0)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <div style={{ background: '#fff0ee', borderRadius: '50%', width: 72, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Key size={36} color="#e74c3c" />
                </div>
              </div>
              <h3 style={{ margin: '0 0 8px', color: '#1a1a2e' }}>Voy a alquilar un vehículo</h3>
              <p style={{ margin: 0, color: '#888', fontSize: 14 }}>Quiero alquilar un vehículo para mis viajes</p>
            </div>
            <div onClick={() => setTipoCuenta('propietario')} style={{ background: 'white', borderRadius: 16, padding: 32, textAlign: 'center', cursor: 'pointer', border: '2px solid #eee', transition: 'all 0.2s' }}
              onMouseOver={e => { e.currentTarget.style.borderColor='#e74c3c'; e.currentTarget.style.transform='translateY(-2px)' }}
              onMouseOut={e => { e.currentTarget.style.borderColor='#eee'; e.currentTarget.style.transform='translateY(0)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <div style={{ background: '#fff0ee', borderRadius: '50%', width: 72, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DollarSign size={36} color="#e74c3c" />
                </div>
              </div>
              <h3 style={{ margin: '0 0 8px', color: '#1a1a2e' }}>Voy a registrar mi vehículo</h3>
              <p style={{ margin: 0, color: '#888', fontSize: 14 }}>Comienza a generar ingresos alquilando tu vehículo</p>
            </div>
          </div>
        </div>
      )}

      {pagina === 'registro' && tipoCuenta === 'cliente' && (
        <div style={{ maxWidth: 480, margin: '40px auto', background: 'white', borderRadius: 16, padding: 36, boxShadow: '0 4px 24px rgba(0,0,0,0.10)' }}>
          <button onClick={() => setTipoCuenta('')} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', marginBottom: 16, fontSize: 14 }}>← Volver</button>
          <h2 style={{ margin: '0 0 6px', color: '#1a1a2e' }}>Crear cuenta de cliente</h2>
          <p style={{ color: '#888', fontSize: 14, marginBottom: 24 }}>Completa tus datos para empezar a alquilar</p>
          <label style={labelStyle}>Nombre completo *</label>
          <input name="nombre" placeholder="Tu nombre completo" onChange={inp} style={inputStyle} />
          <label style={labelStyle}>Correo electrónico *</label>
          <input name="email" placeholder="correo@ejemplo.com" onChange={inp} style={inputStyle} />
          <label style={labelStyle}>Contraseña *</label>
          <input name="contrasena" type="password" placeholder="Mínimo 6 caracteres" onChange={inp} style={inputStyle} />
          <label style={labelStyle}>Tipo de documento *</label>
          <select name="tipo_documento" onChange={inp} style={inputStyle}>
            <option value="">Selecciona...</option>
            <option value="DUI">DUI</option>
            <option value="Pasaporte">Pasaporte</option>
          </select>
          <label style={labelStyle}>Número de documento *</label>
          <input name="numero_documento" placeholder="Número de DUI o Pasaporte" onChange={inp} style={inputStyle} />
          <button onClick={registroCliente} style={primaryBtn}>Crear cuenta</button>
        </div>
      )}

      {pagina === 'registro' && tipoCuenta === 'propietario' && (
        <div style={{ maxWidth: 600, margin: '40px auto 80px', background: 'white', borderRadius: 16, padding: 36, boxShadow: '0 4px 24px rgba(0,0,0,0.10)' }}>
          <button onClick={() => setTipoCuenta('')} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', marginBottom: 16, fontSize: 14 }}>← Volver</button>
          <h2 style={{ margin: '0 0 6px', color: '#1a1a2e' }}>Registra tu vehículo</h2>
          <p style={{ color: '#888', fontSize: 14, marginBottom: 24 }}>Comienza a generar ingresos hoy mismo</p>

          <div style={{ background: '#f8f9fa', borderRadius: 10, padding: '16px 20px', marginBottom: 20 }}>
            <h4 style={{ margin: '0 0 12px', color: '#1a1a2e' }}>Tus datos personales</h4>
            <label style={labelStyle}>Nombre completo *</label>
            <input name="nombre" placeholder="Tu nombre completo" onChange={inp} style={inputStyle} />
            <label style={labelStyle}>Correo electrónico *</label>
            <input name="email" placeholder="correo@ejemplo.com" onChange={inp} style={inputStyle} />
            <label style={labelStyle}>Contraseña *</label>
            <input name="contrasena" type="password" placeholder="Mínimo 6 caracteres" onChange={inp} style={inputStyle} />
          </div>

          <div style={{ background: '#f8f9fa', borderRadius: 10, padding: '16px 20px', marginBottom: 20 }}>
            <h4 style={{ margin: '0 0 12px', color: '#1a1a2e' }}>Datos del vehículo</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Tipo *</label>
                <select name="tipo_vehiculo" onChange={inp} style={inputStyle}>
                  <option value="">Selecciona...</option>
                  <option value="Sedan">Sedán</option>
                  <option value="Pickup">Pick-up</option>
                  <option value="Microbus">Microbús</option>
                  <option value="Camioneta">Camioneta</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Marca *</label>
                <input name="marca" placeholder="Toyota, Kia..." onChange={inp} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Modelo *</label>
                <input name="modelo" placeholder="Corolla, Rio..." onChange={inp} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Año *</label>
                <input name="ano" type="number" placeholder="2019" onChange={inp} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Transmisión *</label>
                <select name="transmision" onChange={inp} style={inputStyle}>
                  <option value="">Selecciona...</option>
                  <option value="Automático">Automático</option>
                  <option value="Estándar">Estándar</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Combustible *</label>
                <select name="combustible" onChange={inp} style={inputStyle}>
                  <option value="">Selecciona...</option>
                  <option value="Gasolina">Gasolina</option>
                  <option value="Diesel">Diésel</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Color *</label>
                <input name="color" placeholder="Blanco, Negro..." onChange={inp} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Placa *</label>
                <input name="placa" placeholder="P000-000" onChange={inp} style={inputStyle} />
              </div>
            </div>
          </div>

          <div style={{ background: '#f8f9fa', borderRadius: 10, padding: '16px 20px', marginBottom: 20 }}>
            <h4 style={{ margin: '0 0 12px', color: '#1a1a2e' }}>Ubicación</h4>
            <label style={labelStyle}>Zona *</label>
            <select onChange={e => setZonaVehiculo(e.target.value)} style={inputStyle}>
              <option value="">Selecciona una zona...</option>
              {Object.keys(ZONAS).map(z => <option key={z} value={z}>{z}</option>)}
            </select>
            {zonaVehiculo && (
              <>
                <label style={labelStyle}>Departamento *</label>
                <select name="departamento" onChange={inp} style={inputStyle}>
                  <option value="">Selecciona...</option>
                  {ZONAS[zonaVehiculo].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </>
            )}
          </div>

          <div style={{ background: '#f8f9fa', borderRadius: 10, padding: '16px 20px', marginBottom: 20 }}>
            <h4 style={{ margin: '0 0 12px', color: '#1a1a2e' }}>Precio de alquiler</h4>
            <label style={labelStyle}>Precio base por día ($) *</label>
            <input type="number" placeholder="Ej: 45" onChange={e => setPrecioBase(parseFloat(e.target.value) || 0)} style={inputStyle} />
            {precioBase > 0 && (() => {
              const { comision, iva, total } = calcularPrecios(precioBase)
              return (
                <div style={{ background: 'white', borderRadius: 8, padding: '12px 16px', marginTop: 12, fontSize: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', marginBottom: 4 }}><span>Precio base:</span><span>${precioBase.toFixed(2)}/día</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', marginBottom: 4 }}><span>Comisión Alpha 15%:</span><span>+${comision.toFixed(2)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', marginBottom: 4 }}><span>IVA 13%:</span><span>+${iva.toFixed(2)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#e74c3c', borderTop: '1px solid #ddd', paddingTop: 8, marginTop: 4 }}><span>El cliente pagará:</span><span>${total.toFixed(2)}/día</span></div>
                </div>
              )
            })()}
          </div>

          <div style={{ background: '#f8f9fa', borderRadius: 10, padding: '16px 20px', marginBottom: 24 }}>
            <h4 style={{ margin: '0 0 8px', color: '#1a1a2e' }}>Fotos del vehículo</h4>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: '#888' }}>Fotos claras atraen más clientes</p>
            {[
              { key: 'frontal', label: 'Foto frontal' },
              { key: 'trasera', label: 'Foto trasera' },
              { key: 'interior', label: 'Interior' },
              { key: 'lateral_izq', label: 'Lateral izquierda' },
              { key: 'lateral_der', label: 'Lateral derecha' }
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 12 }}>
                <label style={labelStyle}>{f.label}</label>
                <input type="file" accept="image/*" onChange={e => setFotosPropietario({...fotosPropietario, [f.key]: e.target.files[0]})} style={{ fontSize: 14, width: '100%' }} />
              </div>
            ))}
          </div>

          <button onClick={registroPropietario} style={primaryBtn}>Registrar mi vehículo</button>
        </div>
      )}

      {pagina === 'reservar' && (
        <div style={{ maxWidth: 480, margin: '60px auto', background: 'white', borderRadius: 16, padding: 36, boxShadow: '0 4px 24px rgba(0,0,0,0.10)' }}>
          <h2 style={{ margin: '0 0 6px', color: '#1a1a2e' }}>Confirmar reserva</h2>
          <p style={{ color: '#888', fontSize: 14, marginBottom: 24 }}>Mínimo 3 días de alquiler</p>
          <div style={{ background: '#f8f9fa', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 14 }}>
            {(() => {
              const { comision, iva, total } = calcularPrecios(form.precio || 0)
              return (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', marginBottom: 4 }}><span>Precio base:</span><span>${form.precio}/día</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', marginBottom: 4 }}><span>Comisión 15%:</span><span>+${comision.toFixed(2)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', marginBottom: 4 }}><span>IVA 13%:</span><span>+${iva.toFixed(2)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#e74c3c', borderTop: '1px solid #ddd', paddingTop: 8, marginTop: 4 }}><span>Total/día:</span><span>${total.toFixed(2)}</span></div>
                </>
              )
            })()}
          </div>
          <label style={labelStyle}>Fecha de inicio</label>
          <input name="fecha_inicio" type="date" onChange={inp} style={inputStyle} />
          <label style={labelStyle}>Fecha de fin</label>
          <input name="fecha_fin" type="date" onChange={inp} style={inputStyle} />
          <button onClick={reservar} style={primaryBtn}>Confirmar reserva</button>
          <button onClick={() => setPagina('vehiculos')} style={{ ...primaryBtn, background: 'white', color: '#666', border: '1.5px solid #ddd', marginTop: 8 }}>Cancelar</button>
        </div>
      )}

      {pagina === 'panel' && (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 40px' }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: '#1a1a2e', margin: '0 0 6px' }}>Panel de {nombreUsuario}</h2>
          <p style={{ color: '#888', marginBottom: 24 }}>Gestiona las reservas de tus vehículos</p>
          {reservas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#aaa' }}>
              <Car size={48} color="#ddd" style={{ marginBottom: 12 }} />
              <p>No hay reservas aún</p>
            </div>
          ) : reservas.map(r => (
            <div key={r.id} style={{ background: 'white', borderRadius: 12, padding: 20, marginBottom: 12, border: '1px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <h3 style={{ margin: 0, color: '#1a1a2e' }}>{r.vehiculo}</h3>
                <span style={{ padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: r.estado==='aprobada'?'#d4edda':r.estado==='rechazada'?'#fde':'#fff3cd', color: r.estado==='aprobada'?'#155724':r.estado==='rechazada'?'#e74c3c':'#856404' }}>{r.estado}</span>
              </div>
              <p style={{ margin: '4px 0', color: '#666', fontSize: 14 }}>Cliente: <strong>{r.usuario}</strong></p>
              <p style={{ margin: '4px 0', color: '#666', fontSize: 14 }}>Fechas: {r.fecha_inicio} al {r.fecha_fin}</p>
              <p style={{ margin: '8px 0 0', fontSize: 15 }}>Total: <strong>${r.precio_total}</strong> | Tú recibes: <strong style={{ color: '#27ae60' }}>${r.propietario_recibe}</strong></p>
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
const inputStyle = { width: '100%', padding: '12px 14px', margin: '6px 0', border: '1.5px solid #ddd', borderRadius: 10, fontSize: 15, boxSizing: 'border-box', display: 'block' }
const primaryBtn = { width: '100%', padding: '13px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: 'pointer', marginTop: 8, display: 'block' }
const labelStyle = { fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginTop: 8 }
const sectionTitle = { fontSize: 24, fontWeight: 700, margin: '0 0 24px', color: '#1a1a2e' }
const searchLabel = { display: 'block', fontSize: 12, color: '#666', fontWeight: 600, marginBottom: 6, textAlign: 'left' }
const searchInput = { width: '100%', padding: '10px 12px', border: '1.5px solid #ddd', borderRadius: 8, fontSize: 14, color: '#333', boxSizing: 'border-box' }

export default App