// Mock data for destinations
export const mockDestinations = [
    {
      id: 1,
      nombre: "Buenos Aires",
      pais: "Argentina",
      descripcion: "La vibrante capital de Argentina, conocida por su arquitectura europea y rica vida cultural.",
      imagen_url: "https://images.unsplash.com/photo-1612294037637-ec328d0e075e",
      latitud: -34.6037,
      longitud: -58.3816,
      popularidad: 100,
      destacado: true,
    },
    {
      id: 2,
      nombre: "Bariloche",
      pais: "Argentina",
      descripcion: "Ciudad de montaña famosa por sus paisajes alpinos y chocolates artesanales.",
      imagen_url: "https://images.unsplash.com/photo-1551522355-5aa50c13b3a2",
      latitud: -41.1335,
      longitud: -71.3103,
      popularidad: 90,
      destacado: true,
    },
    {
      id: 3,
      nombre: "Mendoza",
      pais: "Argentina",
      descripcion: "Región vinícola con impresionantes paisajes montañosos y bodegas de renombre mundial.",
      imagen_url: "https://images.unsplash.com/photo-1585874363771-9b2f9a6b8d07",
      latitud: -32.8895,
      longitud: -68.8458,
      popularidad: 85,
      destacado: true,
    },
    {
      id: 4,
      nombre: "Córdoba",
      pais: "Argentina",
      descripcion: "Ciudad universitaria con rica historia colonial y hermosas sierras cercanas.",
      imagen_url: "https://images.unsplash.com/photo-1583266698478-5e736c05c447",
      latitud: -31.4201,
      longitud: -64.1888,
      popularidad: 75,
      destacado: false,
    },
    {
      id: 5,
      nombre: "Salta",
      pais: "Argentina",
      descripcion: "Conocida por su arquitectura colonial bien conservada y paisajes del norte.",
      imagen_url: "https://images.unsplash.com/photo-1587931835344-8ec60a2a3d28",
      latitud: -24.7859,
      longitud: -65.4117,
      popularidad: 70,
      destacado: false,
    },
  ]
  
  // Mock data for places
  export const mockPlaces = [
    {
      id: 1,
      nombre: "Hotel Buenos Aires Plaza",
      descripcion: "Elegante hotel en el centro de Buenos Aires con vistas panorámicas.",
      ubicacion: "Av. 9 de Julio 1234, Buenos Aires",
      tipo: "alojamiento",
      creado_en: "2023-01-15T10:30:00Z",
    },
    {
      id: 2,
      nombre: "Restaurante El Gaucho",
      descripcion: "Auténtica parrilla argentina con los mejores cortes de carne.",
      ubicacion: "Calle Florida 567, Buenos Aires",
      tipo: "restaurante",
      creado_en: "2023-02-20T14:45:00Z",
    },
    {
      id: 3,
      nombre: "Excursión Cataratas del Iguazú",
      descripcion: "Tour guiado por las impresionantes Cataratas del Iguazú.",
      ubicacion: "Puerto Iguazú, Misiones",
      tipo: "excursion",
      creado_en: "2023-03-10T09:15:00Z",
    },
  ]
  
  // Mock data for vacation plans
  export const mockVacationPlans = [
    {
      id: 1,
      usuario_id: 1,
      destino_id: 1,
      fecha_inicio: "2023-12-15",
      fecha_fin: "2023-12-22",
      estado: "planificado",
      creado_en: "2023-11-01T08:30:00Z",
      destino: {
        id: 1,
        nombre: "Buenos Aires",
        pais: "Argentina",
        imagen_url: "https://images.unsplash.com/photo-1612294037637-ec328d0e075e",
      },
    },
    {
      id: 2,
      usuario_id: 1,
      destino_id: 3,
      fecha_inicio: "2024-01-10",
      fecha_fin: "2024-01-20",
      estado: "confirmado",
      creado_en: "2023-10-15T11:45:00Z",
      destino: {
        id: 3,
        nombre: "Mendoza",
        pais: "Argentina",
        imagen_url: "https://images.unsplash.com/photo-1585874363771-9b2f9a6b8d07",
      },
    },
  ]
  
  // Mock data for users
  export const mockUsers = [
    {
      id: 1,
      nombre: "Juan Pérez",
      email: "juan@example.com",
      tipo: "normal",
      creado_en: "2023-01-01T00:00:00Z",
    },
    {
      id: 2,
      nombre: "María López",
      email: "maria@example.com",
      tipo: "propietario",
      creado_en: "2023-01-02T00:00:00Z",
    },
  ]
  
  // Mock data for reservations
  export const mockReservations = [
    {
      id: 1,
      usuario_id: 1,
      lugar_id: 1,
      fecha_inicio: "2023-12-15T14:00:00Z",
      fecha_fin: "2023-12-22T10:00:00Z",
      estado: "confirmada",
      creado_en: "2023-11-05T09:30:00Z",
    },
    {
      id: 2,
      usuario_id: 1,
      lugar_id: 2,
      fecha_inicio: "2023-12-16T20:00:00Z",
      fecha_fin: "2023-12-16T22:30:00Z",
      estado: "pendiente",
      creado_en: "2023-11-06T10:15:00Z",
    },
  ]
  
  // Mock data for activities
  export const mockActivities = [
    {
      id: 1,
      plan_id: 1,
      lugar_id: 2,
      fecha: "2023-12-16",
      hora_inicio: "20:00",
      hora_fin: "22:00",
      notas: "Reserva confirmada",
    },
    {
      id: 2,
      plan_id: 1,
      lugar_id: 3,
      fecha: "2023-12-17",
      hora_inicio: "09:00",
      hora_fin: "17:00",
      notas: "Llevar protector solar",
    },
  ]
  