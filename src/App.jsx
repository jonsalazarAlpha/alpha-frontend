import { useState, useEffect } from 'react'
import axios from 'axios'

const API = 'https://alpha-app-production-fb59.up.railway.app'

function App() {
  const [pagina, setPagina] = useState('inicio')
  const [vehiculos, setVehiculos] = useState([])
  const [reservas, setReservas] = useState([])
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [tipousuario, setTipousuario] = useState(localStorage.getItem('tipousuario') || '')
  const [nombreUsuario, setNombreUsuario] = useState(localStorage.getItem('nombreUsuario') || '')
  const [mensaje, setMensaje] = useState('')
  const [form, setForm] = useState({})

  useEffect(() => {
    if (pagina === 'vehiculos') cargarVehiculos()
    if (pagina === 'panel') cargarReservas()
  }, [pagina])

  const cargarVehiculos = async () => {
    const res = await axios.get(`${API}/vehiculos`)
    setVehiculos(res.data)
  }

  const cargarReservas = async () => {
    try {
      const res = await axios.get(`${API}/propietario/reservas`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setReservas(res.data)
    } catch { setMensaje('Error al cargar reservas') }
  }

  const login = async () => {
    try {
      const res = await axios.post(`${API}/login/usuario`, { email: form.email, contrasena: form.contrasena })
      setToken(res.data.token)
      setTipousuario('usuario')
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('tipousuario', 'usuario')
      setMensaje('Login exitoso')
      setPagina('vehiculos')
    } catch { setMensaje('Credenciales incorrectas') }
  }

  const loginPropietario = async () => {
    try {
      const res = await axios.post(`${API}/login/propietario`, { email: form.email, contrasena: form.contrasena })
      setToken(res.data.token)
      setTipousuario('propietario')
      setNombreUsuario(res.data.nombre)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('tipousuario', 'propietario')
      localStorage.setItem('nombreUsuario', res.data.nombre)
      setMensaje(`Bienvenida ${res.data.nombre}`)
      setPagina('panel')
    } catch { setMensaje('Credenciales incorrectas') }
  }

  const registro = async () => {
    try {
      await axios.post(`${API}/registro/usuario`, { nombre: form.nombre, email: form.email, contrasena: form.contrasena })
      setMensaje('Registro exitoso, ahora inicia sesion')
      setPagina('login')
    } catch { setMensaje('Error al registrarse') }
  }

  const reservar = async () => {
    try {
      const res = await axios.post(`${API}/reservas`, {
        vehiculo_id: form.vehiculo_id,
        fecha_inicio: form.fecha_inicio,
        fecha_fin: form.fecha_fin
      }, { headers: { Authorization: `Bearer ${token}` } })
      setMensaje(`Reserva creada! Total: $${res.data.precio_total} | Plataforma: $${res.data.comision_plataforma} | Propietario recibe: $${res.data.propietario_recibe}`)
      setPagina('vehiculos')
    } catch { setMensaje('Error al reservar. Minimo 3 dias.') }
  }

  const actualizarEstado = async (id, estado) => {
    try {
      await axios.put(`${API}/reservas/${id}/estado`, { estado }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMensaje(`Reserva ${estado} con exito`)
      cargarReservas()
    } catch { setMensaje('Error al actualizar reserva') }
  }

  const cerrarSesion = () => {
    setToken(''); setTipousuario(''); setNombreUsuario('')
    localStorage.clear()
    setPagina('inicio')
  }

  const inp = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const colorEstado = (estado) => {
    if (estado === 'aprobada') return '#27ae60'
    if (estado === 'rechazada') return '#e74c3c'
    return '#f39c12'
  }

  return (
    <div style={{ fontFamily: 'Arial', maxWidth: 860, margin: '0 auto', padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e74c3c', paddingBottom: 10, marginBottom: 20 }}>
        <h1 style={{ color: '#e74c3c', margin: 0, cursor: 'pointer' }} onClick={() => setPagina('inicio')}>ALPHA</h1>
        <div>
          {token ? (
            <>
              {tipousuario === 'usuario' && <button onClick={() => setPagina('vehiculos')} style={btnStyle}>Vehiculos</button>}
              {tipousuario === 'propietario' && <button onClick={() => setPagina('panel')} style={btnStyle}>Mi panel</button>}
              <button onClick={cerrarSesion} style={{ ...btnStyle, background: '#e74c3c', color: 'white' }}>Salir</button>
            </>
          ) : (
            <>
              <button onClick={() => setPagina('login')} style={btnStyle}>Soy cliente</button>
              <button onClick={() => setPagina('login_propietario')} style={{ ...btnStyle, background: '#e74c3c', color: 'white' }}>Soy propietario</button>
              <button onClick={() => setPagina('registro')} style={btnStyle}>Registrarse</button>
            </>
          )}
        </div>
      </div>

      {mensaje && <div style={{ background: '#d4edda', padding: 10, borderRadius: 5, marginBottom: 15, color: '#155724' }}>{mensaje}</div>}

      {pagina === 'inicio' && (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <h2>Alquiler de vehiculos en El Salvador</h2>
          <p>Encuentra el vehiculo perfecto para tu viaje</p>
          <button onClick={() => setPagina('vehiculos')} style={{ ...btnStyle, background: '#e74c3c', color: 'white', padding: '12px 30px', fontSize: 16 }}>Ver vehiculos disponibles</button>
        </div>
      )}

      {pagina === 'login' && (
        <div style={{ maxWidth: 400, margin: '0 auto' }}>
          <h2>Iniciar sesion — Cliente</h2>
          <input name="email" placeholder="Email" onChange={inp} style={inputStyle} />
          <input name="contrasena" type="password" placeholder="Contrasena" onChange={inp} style={inputStyle} />
          <button onClick={login} style={{ ...btnStyle, background: '#e74c3c', color: 'white', width: '100%', padding: 10 }}>Entrar</button>
          <p style={{ textAlign: 'center' }}>No tienes cuenta? <span onClick={() => setPagina('registro')} style={{ color: '#e74c3c', cursor: 'pointer' }}>Registrate</span></p>
        </div>
      )}

      {pagina === 'login_propietario' && (
        <div style={{ maxWidth: 400, margin: '0 auto' }}>
          <h2>Iniciar sesion — Propietario</h2>
          <input name="email" placeholder="Email" onChange={inp} style={inputStyle} />
          <input name="contrasena" type="password" placeholder="Contrasena" onChange={inp} style={inputStyle} />
          <button onClick={loginPropietario} style={{ ...btnStyle, background: '#e74c3c', color: 'white', width: '100%', padding: 10 }}>Entrar como propietario</button>
        </div>
      )}

      {pagina === 'registro' && (
        <div style={{ maxWidth: 400, margin: '0 auto' }}>
          <h2>Crear cuenta</h2>
          <input name="nombre" placeholder="Nombre completo" onChange={inp} style={inputStyle} />
          <input name="email" placeholder="Email" onChange={inp} style={inputStyle} />
          <input name="contrasena" type="password" placeholder="Contrasena" onChange={inp} style={inputStyle} />
          <button onClick={registro} style={{ ...btnStyle, background: '#e74c3c', color: 'white', width: '100%', padding: 10 }}>Crear cuenta</button>
        </div>
      )}

      {pagina === 'vehiculos' && (
        <div>
          <h2>Vehiculos disponibles</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
            {vehiculos.map(v => (
              <div key={v.id} style={{ border: '1px solid #ddd', borderRadius: 8, overflow: 'hidden' }}>
                {v.foto_url && <img src={v.foto_url} alt={v.modelo} style={{ width: '100%', height: 160, objectFit: 'cover' }} />}
                <div style={{ padding: 14 }}>
                  <h3 style={{ color: '#e74c3c', margin: '0 0 8px' }}>{v.marca} {v.modelo}</h3>
                  <p style={{ margin: '4px 0' }}>Año: {v.año}</p>
                  <p style={{ margin: '4px 0' }}>Tipo: {v.tipo}</p>
                  <p style={{ margin: '4px 0' }}>Categoria: {v.categoria}</p>
                  <p style={{ fontWeight: 'bold', color: '#27ae60' }}>${v.precio_por_dia}/dia</p>
                  <button onClick={() => { setForm({ vehiculo_id: v.id, precio: v.precio_por_dia }); setPagina('reservar') }} style={{ ...btnStyle, background: '#e74c3c', color: 'white', width: '100%', marginTop: 8 }}>Reservar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pagina === 'reservar' && (
        <div style={{ maxWidth: 400, margin: '0 auto' }}>
          <h2>Hacer reserva</h2>
          <p>Precio por dia: <strong>${form.precio}</strong></p>
          <label>Fecha inicio:</label>
          <input name="fecha_inicio" type="date" onChange={inp} style={inputStyle} />
          <label>Fecha fin:</label>
          <input name="fecha_fin" type="date" onChange={inp} style={inputStyle} />
          <button onClick={reservar} style={{ ...btnStyle, background: '#e74c3c', color: 'white', width: '100%', padding: 10 }}>Confirmar reserva</button>
          <button onClick={() => setPagina('vehiculos')} style={{ ...btnStyle, width: '100%', padding: 10, marginTop: 8 }}>Cancelar</button>
        </div>
      )}

      {pagina === 'panel' && (
        <div>
          <h2>Panel de {nombreUsuario}</h2>
          <h3>Reservas de mis vehiculos</h3>
          {reservas.length === 0 ? (
            <p style={{ color: '#888' }}>No hay reservas aun.</p>
          ) : (
            reservas.map(r => (
              <div key={r.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16, marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, color: '#e74c3c' }}>{r.vehiculo}</h3>
                  <span style={{ background: colorEstado(r.estado), color: 'white', padding: '3px 10px', borderRadius: 20, fontSize: 12 }}>{r.estado}</span>
                </div>
                <p style={{ margin: '6px 0' }}>Cliente: <strong>{r.usuario}</strong></p>
                <p style={{ margin: '4px 0' }}>Fechas: {r.fecha_inicio} al {r.fecha_fin}</p>
                <p style={{ margin: '4px 0' }}>Total: <strong>${r.precio_total}</strong> | Tu recibes: <strong style={{ color: '#27ae60' }}>${r.propietario_recibe}</strong></p>
                {r.estado === 'pendiente' && (
                  <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                    <button onClick={() => actualizarEstado(r.id, 'aprobada')} style={{ ...btnStyle, background: '#27ae60', color: 'white', flex: 1 }}>Aprobar</button>
                    <button onClick={() => actualizarEstado(r.id, 'rechazada')} style={{ ...btnStyle, background: '#e74c3c', color: 'white', flex: 1 }}>Rechazar</button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

const btnStyle = { margin: '0 5px', padding: '8px 16px', border: '1px solid #ddd', borderRadius: 5, cursor: 'pointer', background: 'white' }
const inputStyle = { width: '100%', padding: 10, margin: '8px 0', border: '1px solid #ddd', borderRadius: 5, boxSizing: 'border-box', display: 'block' }

export default App