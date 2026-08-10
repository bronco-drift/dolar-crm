import { useEffect, useRef, useState } from 'react'
import {
  type Jugador,
  getArchivados,
  getJugadores,
  saveArchivados,
  saveJugadores,
} from '../lib/storage'
import { emojisDisponibles } from '../lib/emojis'
import { alternarVoz, despertarVoz, hablar, vozActiva, vozDisponible } from '../lib/voz'

type Vista =
  | 'menu'
  | 'garabato'
  | 'memoria'
  | 'describir'
  | 'simultaneo'
  | 'emojis'
  | 'tematico'
  | 'futbol'
  | 'cosas101'
  | 'bloque'
  | 'archivados'

// Emojis dibujables: nada de caras sutiles ni banderas.
const EMOJIS = [
  '🐙','🦒','🐢','🦔','🐧','🦩','🐘','🦕','🦋','🐌','🦑','🐝','🦉','🐳','🦖','🐊',
  '🌵','🍄','🌻','🍕','🍔','🍦','🥑','🍉','🥨','🧁','🌮','🍩','☕','🍺',
  '🚲','🚀','⛵','🚁','🛵','🎸','🎺','🥁','📷','⏰','🔑','☂️','👑','🕶️','🧦','👟',
  '🏰','⛺','🗼','🚦','🪑','🛋️','🪜','🧸','🎈','🎁','🧩','⚽','🏀','🪁',
  '🌈','⚡','🔥','❄️','🌙','⭐','🌊','🗻',
]

// Cosas 101: lo más simple del mundo, para entrar en calor.
const COSAS_101 = [
  'Una casa',
  'Un sol',
  'Un gato',
  'Un árbol',
  'Un auto',
  'Un pez',
  'Una flor',
  'Una taza',
  'Una pelota',
  'Una estrella',
  'Un corazón',
  'Una llave',
  'Un zapato',
  'Un sombrero',
  'Un libro',
  'Un reloj',
  'Una silla',
  'Un pájaro',
  'Un barco',
  'Un globo',
  'Un paraguas',
  'La luna',
  'Una nube',
  'Una escalera',
  'Un lápiz',
  'Una tijera',
  'Un teléfono',
  'Una cama',
  'Una puerta',
  'Una ventana',
  'Un martillo',
  'Una botella',
  'Una cuchara',
  'Un hongo',
  'Un cactus',
  'Un dado',
  'Una campana',
  'Una lámpara',
  'Una guitarra',
  'Una bicicleta',
  'Un cohete',
  'Una corona',
  'Una mariposa',
  'Un huevo frito',
  'Una banana',
  'Una manzana',
  'Un helado',
  'Una vela encendida',
  'Un perro',
  'Una montaña',
  'Un ojo',
  'Una mano',
  'Un fantasma',
  'Un caracol',
  'Una pizza',
  'Un regalo',
  'Una nota musical',
  'Un semáforo',
  'Un ancla',
  'Un rayo',
  'Un avión',
  'Un tren',
  'Un robot',
  'Un castillo',
  'Un dinosaurio',
  'Unos anteojos',
  'Una mochila',
  'Una raqueta',
  'Un tambor',
  'Una trompeta',
  'Una sartén',
  'Un tenedor',
  'Un plato',
  'Una torta',
  'Una dona',
  'Una taza de café',
  'Una cámara de fotos',
  'Una computadora',
  'Un celular',
  'Un sobre',
  'Una brújula',
  'Un faro',
  'Una carpa',
  'Una hoja de árbol',
  'Una piña',
  'Un racimo de uvas',
  'Una zanahoria',
  'Un queso',
  'Un pan',
  'Una hamburguesa',
  'Un pingüino',
  'Un elefante',
  'Una tortuga',
  'Una araña',
  'Un cangrejo',
  'Una ballena',
  'Un cerdo',
  'Una vaca',
  'Un pulpo',
  'Un sombrero de copa',
  'Una corbata',
  'Un reloj de arena',
  'Una lupa',
  'Un candado',
  'Un timón',
  'Una maceta',
  'Un ventilador',
  'Un termómetro',
  'Una jaula',
  'Un balde',
  'Una carretilla',
  'Un puente',
  'Un iglú',
  'Un molino',
  'Una fogata',
  'Un trineo',
  'Un pincel',
  // ── Animales ──
  'Un león',
  'Un tigre',
  'Un oso',
  'Un mono',
  'Un conejo',
  'Un ratón',
  'Una oveja',
  'Una gallina',
  'Un pato',
  'Un búho',
  'Un zorro',
  'Un ciervo',
  'Un camello',
  'Un koala',
  'Un canguro',
  'Un delfín',
  'Un tiburón',
  'Una medusa',
  'Una abeja',
  'Una hormiga',
  'Una libélula',
  'Una rana',
  'Un lagarto',
  'Una serpiente',
  'Un murciélago',
  'Una ardilla',
  'Un loro',
  'Un cisne',
  'Un caballito de mar',
  'Un caballo',
  // ── Comida ──
  'Una sandía',
  'Una naranja',
  'Un limón',
  'Una frutilla',
  'Una cereza',
  'Una pera',
  'Un durazno',
  'Un coco',
  'Un ají',
  'Un tomate',
  'Una cebolla',
  'Una papa',
  'Un brócoli',
  'Un choclo',
  'Un huevo',
  'Un panqueque',
  'Una galleta',
  'Un chupetín',
  'Un caramelo',
  'Un cupcake',
  'Un pochoclo',
  'Unas papas fritas',
  'Una salchicha',
  'Un plato de sopa',
  'Un frasco de miel',
  // ── Objetos ──
  'Una paleta de pintor',
  'Una regla',
  'Un clip',
  'Un botón',
  'Un peine',
  'Un cepillo de dientes',
  'Un espejo',
  'Un jabón',
  'Una toalla',
  'Un destornillador',
  'Una llave inglesa',
  'Un clavo',
  'Un serrucho',
  'Una pala',
  'Un rastrillo',
  'Una regadera',
  'Una linterna',
  'Un enchufe',
  'Una bombita de luz',
  'Un imán',
  'Una pesa',
  'Una cinta métrica',
  'Un embudo',
  'Un colador',
  'Un rallador',
  'Un abrelatas',
  'Una aguja con hilo',
  'Un alfiler',
  // ── Transporte y lugares ──
  'Un camión',
  'Un colectivo',
  'Una moto',
  'Una patineta',
  'Unos patines',
  'Un helicóptero',
  'Un submarino',
  'Un globo aerostático',
  'Una ambulancia',
  'Un tractor',
  'Una grúa',
  'Una boya',
  'Una cabaña',
  'Una iglesia',
  'Una torre',
  'Una rueda de la fortuna',
  'Un tobogán',
  'Una hamaca',
  // ── Naturaleza ──
  'Un arcoíris',
  'Un copo de nieve',
  'Una gota de agua',
  'Una ola',
  'Un volcán',
  'Una isla',
  'Una palmera',
  'Un pino',
  'Un girasol',
  'Un tulipán',
  'Una rosa',
  'Un trébol',
  'Una estrella de mar',
  'Un caracol de mar',
  // ── Deportes y música ──
  'Una pelota de básquet',
  'Un guante de béisbol',
  'Unos dardos',
  'Un casco',
  'Una medalla',
  'Un trofeo',
  'Un piano',
  'Un violín',
  'Un saxofón',
  'Un acordeón',
  'Un micrófono',
  'Unos auriculares',
  'Un parlante',
  'Una radio',
  // ── Ropa ──
  'Una remera',
  'Un pantalón',
  'Un vestido',
  'Una campera',
  'Una bufanda',
  'Un gorro de lana',
  'Un guante',
  'Una media',
  'Una bota',
  'Un cinturón',
  'Una cartera',
  'Unos lentes de sol',
  'Un reloj pulsera',
]

// Nivel difícil: escenas con varias partes y cosas que no tienen forma.
const COSAS_DIFICILES = [
  'Una bicicleta con su cadena',
  'Un pulpo tocando el piano',
  'Una jirafa con bufanda',
  'Un despertador a cuerda',
  'Un helicóptero',
  'Una máquina de escribir',
  'Un carrito de supermercado',
  'Un tocadiscos',
  'Una cafetera italiana',
  'Un caballo galopando',
  'Una escalera caracol',
  'Un castillo con foso y puente',
  'Una moto con sidecar',
  'Un pavo real con la cola abierta',
  'Un dragón echando fuego',
  'Un tren cruzando un puente',
  'Un astronauta flotando',
  'Una mano haciendo el signo de ok',
  'Un rostro de perfil',
  'Un pulpo dentro de una pecera',
  'Un ventilador de techo desde abajo',
  'Una jaula con un pájaro adentro',
  'Un pulpo con sombrero de copa',
  'Una orquesta de tres músicos',
  'Un mono colgado de una rama',
  'Un cangrejo con anteojos',
  'Una tortuga con caparazón de ciudad',
  'Un molino con las aspas girando',
  'Una máquina de coser',
  'Un esqueleto de dinosaurio',
  'Un pulpo haciendo malabares',
  'Una cabina telefónica',
  'Un semáforo con tres autos esperando',
  'Un pingüino con corbata',
  'Un barco dentro de una botella',
  // Sin forma: hay que resolverlas con ideas
  'La libertad',
  'El silencio',
  'La nostalgia',
  'El tiempo',
  'La suerte',
  'El miedo',
  'La velocidad',
  'El equilibrio',
  'La curiosidad',
  'El caos',
  'La paciencia',
  'El futuro',
  'La amistad',
  'El aburrimiento',
  'La memoria',
  // ── Escenas con varias partes ──
  'Un pulpo cocinando en cuatro ollas',
  'Una jirafa entrando a un ascensor',
  'Un elefante en una hamaca',
  'Un gato tocando el violín',
  'Un pingüino en el desierto',
  'Un astronauta paseando un perro',
  'Un robot regando plantas',
  'Una tortuga con cohete en el caparazón',
  'Un oso pescando en un río',
  'Una ciudad vista desde un avión',
  'Un mercado con puestos',
  'Una banda tocando en la plaza',
  'Una fila de gente esperando',
  'Un partido con la tribuna llena',
  'Una fábrica con chimeneas',
  'Un puerto con grúas',
  'Un laberinto',
  'Un reloj derritiéndose',
  'Una escalera imposible',
  'Un caballo de ajedrez',
  'Un piano de cola',
  'Una bicicleta desarmada',
  'Un motor de auto',
  'Un esqueleto humano',
  'Una mano escribiendo',
  'Un ojo con pestañas y reflejo',
  'Una pareja bailando',
  'Un bebé gateando',
  'Un pulpo jugando al ajedrez consigo mismo',
  'Una casa dada vuelta',
  'Un árbol con raíces al aire',
  'Un espejo reflejando otra cosa',
  'Una sombra que no coincide',
  'Un edificio en construcción',
  'Un choque de dos autos',
  // ── Sin forma: hay que resolverlas con ideas ──
  'La envidia',
  'La rutina',
  'El desorden',
  'La espera',
  'La inflación',
  'El insomnio',
  'La ansiedad',
  'El déjà vu',
  'La injusticia',
  'El progreso',
  'La soledad',
  'El chisme',
  'La esperanza',
  'El destino',
  'La verdad',
  'El secreto',
  'La distancia',
  'El olvido',
  'El vértigo',
  'La gravedad',
]

// Niveles del bloque: se agregan sumando entradas acá.
const NIVELES_BLOQUE = [
  { id: 'facil', nombre: 'Fácil', banco: COSAS_101 },
  { id: 'dificil', nombre: 'Difícil', banco: COSAS_DIFICILES },
]

// Fútbol emoji: tres pistas y a adivinar de quién se trata.
const FUTBOL: { e: string; n: string }[] = [
  { e: '🐐 🇦🇷 🦩', n: 'Lionel Messi' },
  { e: '🇵🇹 🇸🇦 🐪', n: 'Cristiano Ronaldo' },
  { e: '🇫🇷 🐢 👑', n: 'Kylian Mbappé' },
  { e: '🇳🇴 🤖 🧘', n: 'Erling Haaland' },
  { e: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 👐 🎯', n: 'Jude Bellingham' },
  { e: '🇧🇷 ⚡ 🕺', n: 'Vinícius Júnior' },
  { e: '🇪🇸 👶 💎', n: 'Lamine Yamal' },
  { e: '🇵🇱 🏹 🐯', n: 'Robert Lewandowski' },
  { e: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 🇩🇪 🏹', n: 'Harry Kane' },
  { e: '🇧🇪 🧠 🎯', n: 'Kevin De Bruyne' },
  { e: '🇪🇬 👑 🏹', n: 'Mohamed Salah' },
  { e: '🇺🇾 🦫 🧛', n: 'Luis Suárez' },
  { e: '🇧🇷 🪄 🏥', n: 'Neymar Jr' },
  { e: '🇫🇷 🧉 💇', n: 'Antoine Griezmann' },
  { e: '🇭🇷 🪄 🧙', n: 'Luka Modrić' },
  { e: '🇦🇷 🧤 🤪', n: 'Emiliano Martínez' },
  { e: '🇦🇷 🐂 🐂', n: 'Lautaro Martínez' },
  { e: '🇦🇷 🕷️ 🕸️', n: 'Julián Álvarez' },
  { e: '🇦🇷 🛡️ 🧉', n: 'Rodrigo De Paul' },
  { e: '🇦🇷 🏹 🫶', n: 'Ángel Di María' },
  { e: '🇸🇪 🦁 🥋', n: 'Zlatan Ibrahimović' },
  { e: '🇧🇷 🤙 🤙', n: 'Ronaldinho' },
  { e: '🇧🇷 👑 👑', n: 'Pelé' },
  { e: '🇦🇷 🔟 🌦️', n: 'Diego Maradona' },
  { e: '🇫🇷 🪄 💇', n: 'Zinedine Zidane' },
  { e: '🇧🇷 👑 💇', n: 'Ronaldo Nazário' },
  { e: '🇫🇷 🇸🇦 🩹', n: 'Karim Benzema' },
  { e: '🇰🇷 📸 🤍', n: 'Son Heung-min' },
  { e: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 🌶️ 🌶️', n: 'Bukayo Saka' },
  { e: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 🧯 🎯', n: 'Phil Foden' },
  { e: '🇵🇹 🪄 🪵', n: 'Bernardo Silva' },
  { e: '🇵🇹 🗣️ 🪄', n: 'Bruno Fernandes' },
  { e: '🇨🇦 ⚡ 🚗', n: 'Alphonso Davies' },
  { e: '🇪🇸 🥽 🪄', n: 'Pedri' },
  { e: '🇪🇸 🥊 🪵', n: 'Gavi' },
  { e: '🇺🇾 🦅 🚀', n: 'Federico Valverde' },
  { e: '🇺🇾 🌪️ 🪵', n: 'Darwin Núñez' },
  { e: '🇨🇴 ⚡ 🦈', n: 'Luis Díaz' },
  { e: '🇨🇴 🏹 🪄', n: 'James Rodríguez' },
  { e: '🇨🇱 🪄 🐕', n: 'Alexis Sánchez' },
  { e: '🇨🇱 👑 💇', n: 'Arturo Vidal' },
  { e: '🇸🇳 ⚡ 🇸🇦', n: 'Sadio Mané' },
  { e: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 🧠 👉', n: 'Marcus Rashford' },
  { e: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 🪵 🍾', n: 'Jack Grealish' },
  { e: '🇧🇪 🦏 🪵', n: 'Romelu Lukaku' },
  { e: '🇫🇷 🪵 🪵', n: 'Olivier Giroud' },
  { e: '🇮🇹 🧤 🗼', n: 'Gianluigi Donnarumma' },
  { e: '🇩🇪 🧤 🛡️', n: 'Manuel Neuer' },
  { e: '🇧🇪 🧤 🦒', n: 'Thibaut Courtois' },
  // ── Sumados ──
  { e: '🇪🇸 🪄 🇯🇵', n: 'Andrés Iniesta' },
  { e: '🇪🇸 🧠 🎼', n: 'Xavi Hernández' },
  { e: '🇪🇸 🛡️ 🟥', n: 'Sergio Ramos' },
  { e: '🇪🇸 🧤 😇', n: 'Iker Casillas' },
  { e: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 🎯 💇', n: 'David Beckham' },
  { e: '🇫🇷 🏹 🇬🇧', n: 'Thierry Henry' },
  { e: '🇮🇹 🧠 🍷', n: 'Andrea Pirlo' },
  { e: '🇮🇹 🐺 👑', n: 'Francesco Totti' },
  { e: '🇮🇹 🛡️ 🔴', n: 'Paolo Maldini' },
  { e: '🇳🇱 🔄 🚬', n: 'Johan Cruyff' },
  { e: '🇳🇱 🧑‍🦲 ⬅️', n: 'Arjen Robben' },
  { e: '🇳🇱 🛡️ 🗿', n: 'Virgil van Dijk' },
  { e: '🇩🇪 🎯 📐', n: 'Toni Kroos' },
  { e: '🇩🇪 🐭 😜', n: 'Thomas Müller' },
  { e: '🇩🇪 🎯 🤸', n: 'Miroslav Klose' },
  { e: '🇩🇪 👑 🧹', n: 'Franz Beckenbauer' },
  { e: '🇨🇴 🐯 🎯', n: 'Radamel Falcao' },
  { e: '🇦🇷 🎩 🐢', n: 'Juan Román Riquelme' },
  { e: '🇦🇷 🦁 💥', n: 'Gabriel Batistuta' },
  { e: '🇦🇷 🥷 🎮', n: 'Sergio Agüero' },
  { e: '🇦🇷 🪖 💪', n: 'Carlos Tevez' },
  { e: '🇦🇷 🛡️ 👨‍✈️', n: 'Javier Mascherano' },
  { e: '🇦🇷 🎭 💎', n: 'Paulo Dybala' },
  { e: '🇦🇷 🧠 🎯', n: 'Enzo Fernández' },
  { e: '🇦🇷 🛡️ 😤', n: 'Cristian Romero' },
  { e: '🇪🇸 👶 🏹', n: 'Fernando Torres' },
  { e: '🇪🇸 🏹 ⚔️', n: 'David Villa' },
  { e: '🇪🇸 🎯 🤫', n: 'Raúl González' },
  { e: '🇪🇸 🧠 🎹', n: 'Rodri' },
  { e: '🇧🇷 💥 🦵', n: 'Roberto Carlos' },
  { e: '🇧🇷 🏃 ➡️', n: 'Cafú' },
  { e: '🇧🇷 🙏 ⚡', n: 'Kaká' },
  { e: '🇧🇷 🍌 ➡️', n: 'Dani Alves' },
  { e: '🇧🇷 🛡️ 👑', n: 'Thiago Silva' },
  { e: '🇧🇷 🧤 🧱', n: 'Alisson Becker' },
  { e: '🇧🇷 🧤 🦶', n: 'Ederson' },
  { e: '🇧🇷 🕊️ 🦵', n: 'Garrincha' },
  { e: '🇧🇷 🎯 🎉', n: 'Romário' },
  { e: '🇧🇷 🍼 🎯', n: 'Bebeto' },
  { e: '🇫🇷 🐜 🔋', n: "N'Golo Kanté" },
  { e: '🇫🇷 💇 🕺', n: 'Paul Pogba' },
  { e: '🇫🇷 ⚡ 🤸', n: 'Ousmane Dembélé' },
  { e: '🇲🇦 ⚡ ➡️', n: 'Achraf Hakimi' },
  { e: '🇳🇬 🎭 ⚡', n: 'Victor Osimhen' },
  { e: '🇬🇪 🪄 🍕', n: 'Khvicha Kvaratskhelia' },
  { e: '🇳🇴 🧠 🎯', n: 'Martin Ødegaard' },
  { e: '🇵🇹 ⚡ 🎧', n: 'Rafael Leão' },
  { e: '🇩🇪 🕺 ⚡', n: 'Jamal Musiala' },
  { e: '🇭🇺 🎖️ 🎯', n: 'Ferenc Puskás' },
  { e: '🇵🇹 🐆 👑', n: 'Eusébio' },
  { e: '🇷🇺 🧤 🕷️', n: 'Lev Yashin' },
]

// Generador con semilla: el mismo número reproduce el mismo dibujo,
// así se puede repetir una figura más adelante y comparar.
function prng(semilla: number) {
  let a = semilla >>> 0
  return () => {
    a += 0x6d2b79f5
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const nuevaSemilla = () => Math.floor(Math.random() * 9000) + 1000

// ── Luz de borde: alerta que entra por los cantos de la pantalla ──
function LuzBorde({ tipo }: { tipo: 'verde' | 'rojo' | null }) {
  if (!tipo) return null
  return (
    <div className={`luz-borde luz-${tipo}`} aria-hidden="true">
      <span className="luz-lado luz-izq" />
      <span className="luz-lado luz-der" />
      <span className="luz-marco" />
    </div>
  )
}

// ── Cronómetro ──
const PASO = 30
const AVISO = 10

function Cronometro({
  total: inicial = PASO,
  disparo = 0,
}: {
  total?: number
  // Cada vez que cambia, el cronómetro arranca solo (al revelar la consigna).
  disparo?: number
}) {
  const [total, setTotal] = useState(inicial)
  const [quedan, setQuedan] = useState(inicial)
  const [andando, setAndando] = useState(false)
  const [luz, setLuz] = useState<'verde' | 'rojo' | null>(null)
  const timer = useRef<number | undefined>(undefined)
  const verdeTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!andando) return
    timer.current = window.setInterval(() => {
      setQuedan((q) => {
        const siguiente = q - 1
        if (siguiente <= 0) {
          setAndando(false)
          setLuz(null)
          pitido()
          return 0
        }
        if (siguiente <= AVISO) setLuz('rojo')
        return siguiente
      })
    }, 1000)
    return () => clearInterval(timer.current)
  }, [andando])

  useEffect(() => () => clearTimeout(verdeTimer.current), [])

  const arrancar = () => {
    if (andando) {
      setAndando(false)
      setLuz(null)
      return
    }
    const desde = quedan <= 0 ? total : quedan
    setQuedan(desde)
    setAndando(true)
    // Verde: un pulso de arranque que se va solo.
    setLuz(desde <= AVISO ? 'rojo' : 'verde')
    clearTimeout(verdeTimer.current)
    verdeTimer.current = window.setTimeout(
      () => setLuz((l) => (l === 'verde' ? null : l)),
      1700,
    )
  }

  // Arranque automático desde afuera: reinicia y larga.
  useEffect(() => {
    if (!disparo) return
    setQuedan(total)
    setAndando(true)
    setLuz(total <= AVISO ? 'rojo' : 'verde')
    clearTimeout(verdeTimer.current)
    verdeTimer.current = window.setTimeout(
      () => setLuz((l) => (l === 'verde' ? null : l)),
      1700,
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disparo])

  // Abajo de un minuto se mueve de a 5 segundos; arriba, de a 30.
  const salto = (v: number) => (v >= 60 ? PASO : 5)

  const ajustar = (dir: 1 | -1) => {
    const delta = dir > 0 ? salto(total) : -salto(total - 1)
    const nuevo = Math.max(5, Math.min(30 * 60, total + delta))
    setTotal(nuevo)
    if (!andando) {
      setQuedan(nuevo)
      setLuz(null)
    }
  }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
  const poco = quedan <= AVISO && quedan > 0

  return (
    <>
      <LuzBorde tipo={luz} />
      <div className="jp-reloj">
        <div className="jp-reloj-fila">
          <button
            type="button"
            className="jp-mini"
            aria-label="Restar tiempo"
            disabled={total <= 5}
            onClick={() => ajustar(-1)}
          >
            −
          </button>
          <span className={`jp-digitos ${poco ? 'is-poco' : ''}`}>{fmt(quedan)}</span>
          <button
            type="button"
            className="jp-mini"
            aria-label="Sumar tiempo"
            onClick={() => ajustar(1)}
          >
            +
          </button>
          <button type="button" className="btn btn-primary" onClick={arrancar}>
            {andando ? 'Pausar' : quedan === total || quedan === 0 ? 'Arrancar' : 'Seguir'}
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setAndando(false)
              setQuedan(total)
              setLuz(null)
            }}
          >
            Reiniciar
          </button>
        </div>
        <div className="jp-barra">
          <i className={poco ? 'is-poco' : ''} style={{ width: `${(quedan / total) * 100}%` }} />
        </div>
      </div>
    </>
  )
}

// Sonido: preferencia compartida por todos los modos.
const K_SONIDO = 'dolar-crm:papel-sonido'
let sonidoOn = localStorage.getItem(K_SONIDO) !== 'off'

export const sonidoActivo = () => sonidoOn

function alternarSonido() {
  sonidoOn = !sonidoOn
  localStorage.setItem(K_SONIDO, sonidoOn ? 'on' : 'off')
  return sonidoOn
}

function BotonVoz() {
  const [on, setOn] = useState(vozActiva)
  if (!vozDisponible()) return null
  return (
    <button
      type="button"
      className="jp-sonido jp-voz"
      title={on ? 'Dejar de leer en voz alta' : 'Leer las consignas en voz alta'}
      aria-label={on ? 'Dejar de leer en voz alta' : 'Leer las consignas en voz alta'}
      onClick={(e) => {
        e.stopPropagation()
        const nuevo = alternarVoz()
        setOn(nuevo)
        if (nuevo) despertarVoz()
      }}
    >
      {on ? '🗣️' : '🤐'}
    </button>
  )
}

// La consigna se lee desde el otro lado de la mesa, así que va lo más
// grande posible: el CSS baja un escalón por cada tramo de largo.
const claseLargo = (txt: string | null | undefined) => {
  const n = txt?.length ?? 0
  if (n > 30) return 'is-muy-largo'
  if (n > 16) return 'is-largo'
  return ''
}

function BotonSonido() {
  const [on, setOn] = useState(sonidoOn)
  return (
    <button
      type="button"
      className="jp-sonido"
      title={on ? 'Silenciar' : 'Activar sonido'}
      aria-label={on ? 'Silenciar' : 'Activar sonido'}
      onClick={(e) => {
        e.stopPropagation()
        setOn(alternarSonido())
      }}
    >
      {on ? '🔊' : '🔇'}
    </button>
  )
}

// Un tono corto para los cambios de consigna.
function tic() {
  tonos([0], 660)
}

// Tres tonos: se acabó el tiempo.
function pitido() {
  tonos([0, 0.28, 0.56], 880)
}

function tonos(tiempos: number[], hz: number) {
  if (!sonidoOn) return
  try {
    const Ctx = window.AudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    for (const t of tiempos) {
      const osc = ctx.createOscillator()
      const gan = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = hz
      gan.gain.setValueAtTime(0.0001, ctx.currentTime + t)
      gan.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + t + 0.02)
      gan.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.22)
      osc.connect(gan)
      gan.connect(ctx.destination)
      osc.start(ctx.currentTime + t)
      osc.stop(ctx.currentTime + t + 0.24)
    }
    setTimeout(() => ctx.close(), 1400)
  } catch {
    /* sin audio, sin drama */
  }
}

// ── Marcador de jugadores ──
function Marcador({
  jugadores,
  guardar,
}: {
  jugadores: Jugador[]
  guardar: (js: Jugador[]) => void
}) {
  const cambiar = (i: number, cambio: Partial<Jugador>) =>
    guardar(jugadores.map((j, k) => (k === i ? { ...j, ...cambio } : j)))

  return (
    <section className="jp-jugadores">
      {jugadores.map((j, i) => (
        <div className="jp-jug" key={i}>
          <input
            value={j.nombre}
            aria-label={`Nombre del jugador ${i + 1}`}
            onChange={(e) => cambiar(i, { nombre: e.target.value })}
          />
          <button
            type="button"
            className="jp-mini"
            aria-label="Restar punto"
            onClick={() => cambiar(i, { puntos: Math.max(0, j.puntos - 1) })}
          >
            −
          </button>
          <span className="jp-pts">{j.puntos}</span>
          <button
            type="button"
            className="jp-mini"
            aria-label="Sumar punto"
            onClick={() => cambiar(i, { puntos: j.puntos + 1 })}
          >
            +
          </button>
          {jugadores.length > 2 && (
            <button
              type="button"
              className="jp-quitar"
              aria-label="Quitar jugador"
              onClick={() => guardar(jugadores.filter((_, k) => k !== i))}
            >
              ✕
            </button>
          )}
        </div>
      ))}
      <div className="jp-jug-acciones">
        <button
          type="button"
          className="btn-ghost"
          onClick={() =>
            guardar([...jugadores, { nombre: `Jugador ${jugadores.length + 1}`, puntos: 0 }])
          }
        >
          + Jugador
        </button>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => guardar(jugadores.map((j) => ({ ...j, puntos: 0 })))}
        >
          Poner en cero
        </button>
      </div>
    </section>
  )
}

// ── Motor de consignas: lo usan "De memoria" y los modos temáticos ──
function JuegoConsignas({
  titulo,
  sub,
  banco,
  nombres,
  jugadores,
  guardar,
}: {
  titulo: string
  sub: string
  banco: Record<string, string[]>
  nombres: Record<string, string>
  jugadores: Jugador[]
  guardar: (js: Jugador[]) => void
}) {
  const [cat, setCat] = useState('todas')
  const [ronda, setRonda] = useState(0)
  const [consigna, setConsigna] = useState<{ cat: string; txt: string } | null>(null)
  const usadas = useRef<string[]>([])
  const [disparo, setDisparo] = useState(0)

  const sacar = () => {
    const pool =
      cat === 'todas'
        ? Object.entries(banco).flatMap(([k, v]) => v.map((txt) => ({ cat: k, txt })))
        : banco[cat].map((txt) => ({ cat, txt }))
    let libres = pool.filter((p) => !usadas.current.includes(p.txt))
    if (!libres.length) {
      usadas.current = []
      libres = pool
    }
    const el = libres[Math.floor(Math.random() * libres.length)]
    usadas.current.push(el.txt)
    setConsigna(el)
    setRonda((r) => r + 1)
    setDisparo((d) => d + 1) // el reloj arranca con la consigna
  }

  return (
    <section className="jp-hoja">
      <h2 className="jp-titulo">{titulo}</h2>
      <p className="jp-sub">{sub}</p>

      <div className="jp-etiqueta">De dónde sale la consigna</div>
      <div className="filtros">
        {['todas', ...Object.keys(banco)].map((c) => (
          <button
            type="button"
            key={c}
            className={`filtro ${cat === c ? 'is-active' : ''}`}
            onClick={() => {
              setCat(c)
              usadas.current = []
            }}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="jp-consigna">
        <div className="jp-consigna-cat">
          {consigna ? (nombres[consigna.cat] ?? consigna.cat) : 'esperando'}
        </div>
        <div className={`jp-consigna-txt ${claseLargo(consigna?.txt)}`}>
          {consigna?.txt ?? 'Sacá una consigna'}
        </div>
      </div>
      <div className="jp-codigo">ronda {consigna ? ronda : '—'}</div>

      <div className="jp-acciones">
        <button type="button" className="btn btn-primary" onClick={sacar}>
          {consigna ? 'Otra consigna' : 'Sacar consigna'}
        </button>
      </div>

      <Cronometro disparo={disparo} />
      <Marcador jugadores={jugadores} guardar={guardar} />
    </section>
  )
}

// ── 01 · Garabato ──
function trazoGarabato(semilla: number, dificultad: number) {
  const r = prng(semilla)
  const W = 640
  const H = 340
  const m = 55
  const cant = [5, 7, 10][dificultad - 1]
  const pts: [number, number][] = []
  for (let i = 0; i < cant; i++) pts.push([m + r() * (W - 2 * m), m + r() * (H - 2 * m)])
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`
  const t = dificultad === 1 ? 0.14 : dificultad === 2 ? 0.26 : 0.42
  for (let j = 0; j < pts.length - 1; j++) {
    const p0 = pts[j - 1] || pts[j]
    const p1 = pts[j]
    const p2 = pts[j + 1]
    const p3 = pts[j + 2] || pts[j + 1]
    const c1x = p1[0] + (p2[0] - p0[0]) * t
    const c1y = p1[1] + (p2[1] - p0[1]) * t
    const c2x = p2[0] - (p3[0] - p1[0]) * t
    const c2y = p2[1] - (p3[1] - p1[1]) * t
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`
  }
  return { d, W, H }
}

// ── 03 · Figura para describir ──
function figuraSvg(semilla: number, nFormas: number) {
  const r = prng(semilla)
  const W = 640
  const H = 420
  const m = 55
  const tipos = ['circulo', 'cuadrado', 'triangulo', 'linea', 'arco', 'zigzag', 'cruz', 'estrella']
  const partes: string[] = []
  for (let i = 0; i < nFormas; i++) {
    const tipo = tipos[Math.floor(r() * tipos.length)]
    const cx = m + r() * (W - 2 * m)
    const cy = m + r() * (H - 2 * m)
    const s = 32 + r() * 76
    const rot = Math.floor(r() * 360)
    let g = ''
    if (tipo === 'circulo') g = `<circle cx="0" cy="0" r="${(s / 2).toFixed(1)}"/>`
    else if (tipo === 'cuadrado')
      g = `<rect x="${(-s / 2).toFixed(1)}" y="${(-s / 2).toFixed(1)}" width="${s.toFixed(1)}" height="${(s * (0.6 + r() * 0.8)).toFixed(1)}"/>`
    else if (tipo === 'triangulo')
      g = `<path d="M 0 ${(-s / 2).toFixed(1)} L ${(s / 2).toFixed(1)} ${(s / 2).toFixed(1)} L ${(-s / 2).toFixed(1)} ${(s / 2).toFixed(1)} Z"/>`
    else if (tipo === 'linea')
      g = `<line x1="${(-s).toFixed(1)}" y1="0" x2="${s.toFixed(1)}" y2="0"/>`
    else if (tipo === 'arco')
      g = `<path d="M ${(-s / 2).toFixed(1)} 0 A ${(s / 2).toFixed(1)} ${(s / 2).toFixed(1)} 0 0 1 ${(s / 2).toFixed(1)} 0"/>`
    else if (tipo === 'zigzag') {
      let d = `M ${(-s).toFixed(1)} 0`
      const dx = (2 * s) / 4
      for (let z = 1; z <= 4; z++)
        d += ` L ${(-s + dx * z).toFixed(1)} ${(z % 2 ? -s / 2.4 : s / 2.4).toFixed(1)}`
      g = `<path d="${d}"/>`
    } else if (tipo === 'cruz')
      g = `<line x1="${(-s / 2).toFixed(1)}" y1="0" x2="${(s / 2).toFixed(1)}" y2="0"/><line x1="0" y1="${(-s / 2).toFixed(1)}" x2="0" y2="${(s / 2).toFixed(1)}"/>`
    else {
      let pd = ''
      const R = s / 2
      const rr = R * 0.42
      for (let k = 0; k < 10; k++) {
        const ang = -Math.PI / 2 + (k * Math.PI) / 5
        const rad = k % 2 ? rr : R
        pd += `${k ? ' L ' : 'M '}${(Math.cos(ang) * rad).toFixed(1)} ${(Math.sin(ang) * rad).toFixed(1)}`
      }
      g = `<path d="${pd} Z"/>`
    }
    partes.push(
      `<g transform="translate(${cx.toFixed(1)},${cy.toFixed(1)}) rotate(${rot})" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">${g}</g>`,
    )
  }
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Figura para describir">${partes.join('')}</svg>`
}

const BANCO: Record<string, string[]> = {
  objetos: [
    'Una bicicleta completa',
    'Un sacacorchos de dos brazos',
    'Una cafetera italiana',
    'Un mate con bombilla',
    'Un teléfono de disco',
    'Un ventilador de techo',
    'Una tijera abierta',
    'Un candado con la llave puesta',
    'Un paraguas abierto',
    'Una guitarra criolla',
    'Una octava de piano con sus teclas negras',
    'Un colectivo de costado',
    'Un avión visto de frente',
    'Una carretilla',
    'Un semáforo con su poste',
    'Un teclado completo con todas sus letras',
    'Un billete con su cara y sus números',
    'Un sacapuntas',
    'Un budare con una arepa encima',
    'Un cuatro venezolano con sus clavijas',
    'Unas maracas',
    'Una licuadora',
    'Un termo de agua caliente',
    'Un abanico de mano abierto',
    'Una plancha de ropa',
    'Un molinillo de café',
    'Una máquina de coser',
    'Un botellón de agua en su dispensador',
  ],
  marcas: [
    'El logo de Nike',
    'El logo de Adidas',
    'El logo de Starbucks',
    'El logo de Mercado Libre',
    'El logo de Apple',
    'El escudo de Ferrari',
    'El león de Peugeot',
    'El logo de YPF',
    'El logo de Havanna',
    'El logo de Polar',
    'El logo de Windows',
    'El símbolo de Bluetooth',
    'El logo de Michelin',
    'El logo de Volkswagen',
    'El logo de Harina P.A.N.',
    'El logo de Savoy',
    'El osito de Toronto',
    'El logo de Maltín Polar',
    'El logo de Pepsi',
    'El logo de Zara',
    'El logo del Real Madrid',
    'El escudo del Barcelona',
    'El logo de Netflix',
    'El logo de WhatsApp',
    'El logo de Quilmes',
    'El logo de Movistar',
  ],
  mapas: [
    'El mapa de Argentina',
    'El mapa de Venezuela',
    'El mapa de Sudamérica',
    'El mapa de Italia (dicen que es fácil)',
    'El mapa de África',
    'La red de subtes de Buenos Aires',
    'El Obelisco con la 9 de Julio',
    'La Torre Eiffel',
    'El mapa de España',
    'Esta casa vista desde arriba',
    'La bandera de Brasil',
    'La bandera de Uruguay',
    'El Salto Ángel',
    'El Ávila visto desde Caracas',
    'La bandera de Venezuela con sus estrellas',
    'El tepuy Roraima',
    'La Sagrada Familia',
    'El Coliseo romano',
    'La Estatua de la Libertad',
    'El mapa de México',
    'La bandera de España con su escudo',
    'El Cristo Redentor',
    'Las Cataratas del Iguazú',
    'La Torre de Pisa',
  ],
  bichos: [
    'La cara del de al lado, sin mirarlo',
    'Tu propia cara, sin espejo',
    'Un caballo de perfil',
    'Una vaca entera',
    'Un cangrejo',
    'Un pulpo',
    'Una jirafa de cuerpo entero',
    'Un escarabajo desde arriba',
    'Una mano abierta con las uñas',
    'Un pingüino',
    'Un caracol',
    'Una hormiga con sus seis patas',
    'Un turpial',
    'Una orquídea',
    'Un araguaney florecido',
    'Un oso frontino',
    'Un tucán',
    'Una guacamaya',
    'Un hornero con su nido',
    'Un toro bravo',
    'Un flamenco parado en una pata',
    'Un perezoso colgado',
  ],
}

const NOMBRE_CAT: Record<string, string> = {
  objetos: 'objeto cotidiano',
  marcas: 'marca conocida',
  mapas: 'mapa o lugar',
  bichos: 'ser vivo',
}

// Modos temáticos: mismo motor de consignas, distinto banco.
interface Tematico {
  num: string
  titulo: string
  resumen: string
  sub: string
  segundos: number
  banco: Record<string, string[]>
  nombres: Record<string, string>
}

const TEMATICOS: Record<string, Tematico> = {
  venezuela: {
    num: '10',
    titulo: '🇻🇪 Venezuela',
    resumen: 'Arepas, tepuyes, gaita y todo lo que un venezolano dibuja con los ojos cerrados.',
    sub: 'Si alguien de afuera está jugando, que sufra un rato.',
    segundos: 120,
    banco: {
      comida: [
        'Una arepa rellena, abierta al medio',
        'Una cachapa con queso de mano',
        'Tres tequeños en un plato',
        'Una hallaca con su hoja de plátano',
        'Un pabellón criollo completo',
        'Un tostón con guasacaca',
        'Un pastelito de queso',
        'Un papelón con limón',
        'Una empanada de cazón',
        'Una Toronto',
        'Un tequeyoyo',
        'Un golfeado con queso',
        'Una polar bien fría',
        'Un pan de jamón cortado',
        'Un dulce de lechosa',
        'Un cocuy con su botella',
      ],
      lugares: [
        'El Salto Ángel',
        'El Ávila con el teleférico',
        'Los Roques desde arriba',
        'El tepuy Roraima',
        'Los Médanos de Coro',
        'El Puente sobre el Lago de Maracaibo',
        'El relámpago del Catatumbo',
        'La Vinotinto celebrando',
        'El Teleférico de Mérida',
        'Un pueblo de la Colonia Tovar',
        'La Cota Mil un domingo',
        'Choroní con sus palmeras',
      ],
      cosas: [
        'Un cuatro venezolano',
        'Unas maracas de capacho',
        'Un budare con la arepa encima',
        'Un paquete de Harina P.A.N.',
        'Una lata de Diablitos',
        'Un botellón de agua',
        'Una planta eléctrica',
        'Un billete de un millón de bolívares',
        'Una gorra de la Vinotinto',
        'Un mango verde con sal',
      ],
      cultura: [
        'Simón Bolívar a caballo',
        'Un turpial cantando',
        'Un araguaney florecido',
        'Una orquídea',
        'Un gaitero con su furro',
        'Un bailarín de joropo',
        'Los Diablos Danzantes de Yare',
        'Una Miss Venezuela con su corona',
        'Un niño de El Sistema con su violín',
        'La bandera con sus ocho estrellas',
      ],
    },
    nombres: { comida: 'comida', lugares: 'lugar', cosas: 'objeto', cultura: 'cultura' },
  },
  argentina: {
    num: '11',
    titulo: '🇦🇷 Argentina',
    resumen: 'Mate, asado, Maradona y todo lo que se dibuja con acento porteño.',
    sub: 'Prohibido quejarse de que no sale la vaca.',
    segundos: 120,
    banco: {
      comida: [
        'Un asado completo en la parrilla',
        'Un mate con termo bajo el brazo',
        'Una empanada tucumana con su repulgue',
        'Un alfajor mordido',
        'Un choripán con chimichurri',
        'Una milanesa napolitana',
        'Un fernet con coca',
        'Media docena de facturas',
        'Un pote de dulce de leche',
        'Una picada completa',
        'Un locro humeante',
        'Una porción de fugazzeta',
      ],
      lugares: [
        'El Obelisco',
        'La Casa Rosada',
        'Caminito con sus casas de colores',
        'La Bombonera llena',
        'El Perito Moreno',
        'Las Cataratas del Iguazú',
        'El fin del mundo en Ushuaia',
        'El Aconcagua',
        'El Congreso',
        'Un colectivo porteño',
        'El Cabildo',
        'La Quebrada de Humahuaca',
      ],
      cosas: [
        'Un bandoneón abierto',
        'Una pelota de fútbol clásica',
        'Un subte con su cartel',
        'Una SUBE',
        'Un billete de mil pesos',
        'Un matambre a la pizza',
        'Un guardapolvo blanco',
        'Un sifón de soda',
      ],
      cultura: [
        'Maradona con la 10',
        'Messi levantando la copa',
        'Carlos Gardel con su sonrisa',
        'Mafalda con su flequillo',
        'Una pareja bailando tango',
        'San Martín cruzando los Andes',
        'El sol de la bandera',
        'Un hincha con la camiseta puesta',
      ],
    },
    nombres: { comida: 'comida', lugares: 'lugar', cosas: 'objeto', cultura: 'cultura' },
  },
  peliculas: {
    num: '12',
    titulo: '🎬 Películas',
    resumen: 'Escenas, personajes y objetos que todos vimos mil veces en el cine.',
    sub: 'Sin decir el título, obvio.',
    segundos: 120,
    banco: {
      escenas: [
        'La proa del Titanic con los brazos abiertos',
        'La aleta del tiburón acercándose',
        'La bicicleta cruzando la luna',
        'El auto volando con las puertas hacia arriba',
        'La lluvia de meteoritos sobre un dinosaurio',
        'Un cartel de Hollywood en la colina',
        'Una casa volando con globos',
        'Un tipo bailando bajo la lluvia con paraguas',
        'Una pareja corriendo por la playa',
        'Un ring de boxeo con las escaleras del museo',
      ],
      personajes: [
        'Un vaquero del lejano oeste',
        'Un mago con anteojos redondos y cicatriz',
        'Un ogro verde con orejas de trompeta',
        'Un extraterrestre con el dedo brillante',
        'Un vagabundo con bastón y bigotito',
        'Un espía de smoking con pistola',
        'Un arqueólogo con sombrero y látigo',
        'Un payaso asomándose a una alcantarilla',
        'Una princesa con dos rodetes',
        'Un robot amarillo que junta basura',
      ],
      objetos: [
        'Un sable de luz encendido',
        'Un anillo dorado con inscripción',
        'Una varita mágica',
        'Un DeLorean con las puertas abiertas',
        'Una máscara blanca de porcelana',
        'Un carrito de pochoclo',
        'Una claqueta de cine',
        'Un rollo de película desenrollado',
        'Una estatuilla dorada de premio',
        'Un tridente de rey del mar',
      ],
    },
    nombres: { escenas: 'escena', personajes: 'personaje', objetos: 'objeto' },
  },
}

// Consignas del modo simultáneo: sujeto + situación, combinables.
// Poco contenido, muchísimas combinaciones y siempre absurdas.
const SUJETOS = [
  'Un pingüino',
  'Un pulpo',
  'Una jirafa',
  'Un cocodrilo',
  'Un astronauta',
  'Una abuela',
  'Un vampiro',
  'Un robot',
  'Un chef',
  'Un dinosaurio',
  'Una sirena',
  'Un fantasma',
  'Un pirata',
  'Un caballo',
  'Un mimo',
  'Un dentista',
  'Una hormiga',
  'Un yeti',
  'Un mago',
  'Un caracol',
  'Un turpial',
  'Una guacamaya',
  'Un llanero',
  'Un gaitero zuliano',
  'Un bachaquero',
  'Un motorizado',
  'Un torero',
  'Un flamenco',
  'Un gaucho',
  'Un vendedor de empanadas',
  'Un árbitro',
  'Un cura',
]

const SITUACIONES = [
  'tomando mate',
  'andando en monopatín',
  'cortándose el pelo',
  'esperando el colectivo',
  'haciendo yoga',
  'lavando los platos',
  'en una entrevista de trabajo',
  'jugando al tenis',
  'con dolor de muelas',
  'sacándose una selfie',
  'armando un mueble',
  'perdido en el supermercado',
  'bailando tango',
  'pintando una pared',
  'atendiendo el teléfono',
  'en la playa con frío',
  'cocinando un asado',
  'corriendo una maratón',
  'mudándose de casa',
  'aprendiendo a andar en bici',
  'haciendo arepas',
  'bailando joropo',
  'en la cola de la panadería',
  'cargando un botellón de agua',
  'subiendo el Ávila',
  'esperando que vuelva la luz',
  'tocando el cuatro',
  'haciendo una hallaca',
  'bailando flamenco',
  'en una verbena',
  'jugando al dominó',
  'cambiando dólares en la calle',
]

const consignaAlAzar = () =>
  `${SUJETOS[Math.floor(Math.random() * SUJETOS.length)]} ${
    SITUACIONES[Math.floor(Math.random() * SITUACIONES.length)]
  }`

export default function Juego2() {
  const [vista, setVista] = useState<Vista>('menu')
  const [archivados, setArchivados] = useState<string[]>(getArchivados)
  const [menuAbierto, setMenuAbierto] = useState<string | null>(null)
  const [jugadores, setJugadores] = useState<Jugador[]>(getJugadores)
  const guardarJugadores = (js: Jugador[]) => {
    setJugadores(js)
    saveJugadores(js)
  }

  // Modo simultáneo: reparto secreto → todos dibujan → adivinanza
  const [fase, setFase] = useState<'reparto' | 'dibujo' | 'adivinar'>('reparto')
  const [turno, setTurno] = useState(0)
  const [verConsigna, setVerConsigna] = useState(false)
  const [consignas, setConsignas] = useState<string[]>([])
  const [revelado, setRevelado] = useState<number[]>([])
  const [dispS, setDispS] = useState(0)

  // Modo emojis: cuenta regresiva → 3 segundos a la vista → a dibujar
  const [faseE, setFaseE] = useState<'espera' | 'cuenta' | 'mostrando' | 'dibujando'>('espera')
  const [cuentaE, setCuentaE] = useState(3)
  const [emojis, setEmojis] = useState<string[]>([])
  const [repaso, setRepaso] = useState(false)
  const [dispE, setDispE] = useState(0)
  const [cantEmojis, setCantEmojis] = useState(1)

  useEffect(() => {
    if (faseE === 'cuenta') {
      if (cuentaE <= 0) {
        setFaseE('mostrando')
        return
      }
      const t = setTimeout(() => setCuentaE((c) => c - 1), 850)
      return () => clearTimeout(t)
    }
    if (faseE === 'mostrando') {
      const t = setTimeout(() => {
        setFaseE('dibujando')
        setDispE((d) => d + 1)
      }, 3000)
      return () => clearTimeout(t)
    }
  }, [faseE, cuentaE])

  const rondaEmojis = () => {
    const elegidos: string[] = []
    while (elegidos.length < cantEmojis) {
      const e = EMOJIS[Math.floor(Math.random() * EMOJIS.length)]
      if (!elegidos.includes(e)) elegidos.push(e)
    }
    setEmojis(elegidos)
    setRepaso(false)
    setCuentaE(3)
    setFaseE('cuenta')
  }

  const nuevaRonda = () => {
    const nuevas: string[] = []
    while (nuevas.length < jugadores.length) {
      const c = consignaAlAzar()
      if (!nuevas.includes(c)) nuevas.push(c)
    }
    setConsignas(nuevas)
    setFase('reparto')
    setTurno(0)
    setVerConsigna(false)
    setRevelado([])
  }

  // Garabato
  const [dif, setDif] = useState(2)
  const [semillaG, setSemillaG] = useState(nuevaSemilla)
  const [dispG, setDispG] = useState(0)
  const garabato = trazoGarabato(semillaG, dif)

  // Modo temático activo (Venezuela, Argentina, Películas)
  const [tema, setTema] = useState<string | null>(null)

  // Cosas 101: ráfaga con auto-avance
  const [luzCosas, setLuzCosas] = useState<'verde' | null>(null)
  const [cosa, setCosa] = useState<string | null>(null)
  const [segCosa, setSegCosa] = useState(10)
  const [restaCosa, setRestaCosa] = useState(10)
  const [corriendo, setCorriendo] = useState(false)
  const [rondaCosas, setRondaCosas] = useState(0)
  const usadasCosas = useRef<string[]>([])

  const siguienteCosa = () => {
    let libres = COSAS_101.filter((c) => !usadasCosas.current.includes(c))
    if (!libres.length) {
      usadasCosas.current = []
      libres = COSAS_101
    }
    const el = libres[Math.floor(Math.random() * libres.length)]
    usadasCosas.current.push(el)
    setCosa(el)
    setRestaCosa(segCosa)
    setRondaCosas((r) => r + 1)
    // El tic marca el corte; la voz entra después para no pisarse.
    setTimeout(() => hablar(el), 260)
  }

  // Un tick por segundo; al llegar a cero, cambia sola de consigna.
  useEffect(() => {
    if (!corriendo) return
    if (restaCosa <= 0) {
      tic()
      siguienteCosa()
      return
    }
    const t = setTimeout(() => setRestaCosa((r) => r - 1), 1000)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [corriendo, restaCosa])

  // Bloque de cosas: una tanda cerrada de 12 o 24, y al final la lista
  const [bloqueTam, setBloqueTam] = useState(12)
  const [segBloque, setSegBloque] = useState(10)
  const [listaBloque, setListaBloque] = useState<string[]>([])
  const [idxBloque, setIdxBloque] = useState(0)
  const [restaBloque, setRestaBloque] = useState(10)
  const [corriendoBloque, setCorriendoBloque] = useState(false)
  const [terminadoBloque, setTerminadoBloque] = useState(false)
  const [pausaBloque, setPausaBloque] = useState(false)
  const [nivelBloque, setNivelBloque] = useState('facil')
  const [reveladasBloque, setReveladasBloque] = useState<number[]>([])
  const [tipoBloque, setTipoBloque] = useState<'cosas' | 'emojis'>('cosas')
  const [luzBloque, setLuzBloque] = useState<'verde' | null>(null)

  const empezarBloque = () => {
    const nivel = NIVELES_BLOQUE.find((n) => n.id === nivelBloque) ?? NIVELES_BLOQUE[0]
    const pool = tipoBloque === 'emojis' ? [...emojisDisponibles()] : [...nivel.banco]
    const elegidas: string[] = []
    while (elegidas.length < bloqueTam && pool.length) {
      elegidas.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0])
    }
    setListaBloque(elegidas)
    setIdxBloque(0)
    setRestaBloque(segBloque)
    setTerminadoBloque(false)
    setPausaBloque(false)
    setReveladasBloque([])
    setCorriendoBloque(true)
    setLuzBloque('verde')
    setTimeout(() => setLuzBloque(null), 1700)
  }

  useEffect(() => {
    if (!corriendoBloque || pausaBloque) return
    if (restaBloque <= 0) {
      if (idxBloque + 1 >= listaBloque.length) {
        setCorriendoBloque(false)
        setTerminadoBloque(true)
        pitido()
      } else {
        setIdxBloque((i) => i + 1)
        setRestaBloque(segBloque)
        tic()
      }
      return
    }
    const t = setTimeout(() => setRestaBloque((r) => r - 1), 1000)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [corriendoBloque, restaBloque, pausaBloque])

  // Fútbol emoji: pistas primero, nombre después
  const [futbolista, setFutbolista] = useState<{ e: string; n: string } | null>(null)
  const [nombreVisible, setNombreVisible] = useState(false)
  const usadosFutbol = useRef<string[]>([])
  const [dispFut, setDispFut] = useState(0)

  const otroFutbolista = () => {
    let libres = FUTBOL.filter((f) => !usadosFutbol.current.includes(f.n))
    if (!libres.length) {
      usadosFutbol.current = []
      libres = FUTBOL
    }
    const el = libres[Math.floor(Math.random() * libres.length)]
    usadosFutbol.current.push(el.n)
    setFutbolista(el)
    setNombreVisible(false)
    setDispFut((d) => d + 1)
  }

  // Describir
  const [formas, setFormas] = useState(3)
  const [semillaF, setSemillaF] = useState(nuevaSemilla)
  const [tapada, setTapada] = useState(true)
  const [dispF, setDispF] = useState(0)

  const chip = (activo: boolean) => `filtro ${activo ? 'is-active' : ''}`

  // El menú como datos: cada juego sabe abrirse solo. Sumar uno nuevo es
  // agregar un objeto acá, y el archivado le sale gratis.
  const JUEGOS: { id: string; titulo: string; resumen: string; abrir: () => void }[] = [
    {
      id: 'cosas101',
      titulo: 'Cosas 101',
      resumen:
        'Para entrar en calor: cosas simples, diez segundos cada una y la pantalla pasa sola a la siguiente.',
      abrir: () => {
        setCorriendo(false)
        setCosa(null)
        setRondaCosas(0)
        setRestaCosa(segCosa)
        setVista('cosas101')
      },
    },
    {
      id: 'bloque-cosas',
      titulo: 'Bloque de cosas',
      resumen:
        'Tanda cerrada de 12 o 24 cosas, con los segundos que quieras. Al final, la lista completa para comparar.',
      abrir: () => {
        setTipoBloque('cosas')
        setCorriendoBloque(false)
        setTerminadoBloque(false)
        setListaBloque([])
        setVista('bloque')
      },
    },
    {
      id: 'bloque-emojis',
      titulo: 'Bloque de emojis',
      resumen:
        'Lo mismo pero con emojis, sacados de todos los que tiene el teléfono. Aparecen cosas que nadie sabe ni cómo se llaman.',
      abrir: () => {
        setTipoBloque('emojis')
        setCorriendoBloque(false)
        setTerminadoBloque(false)
        setListaBloque([])
        setVista('bloque')
      },
    },
    {
      id: 'garabato',
      titulo: 'Garabato',
      resumen:
        'Todos copian el mismo trazo y lo convierten en un dibujo. Gana la idea más inesperada.',
      abrir: () => setVista('garabato'),
    },
    {
      id: 'memoria',
      titulo: 'De memoria',
      resumen:
        'Dibujar de memoria algo que viste mil veces. Spoiler: nadie sabe dónde va la cadena de la bici.',
      abrir: () => setVista('memoria'),
    },
    {
      id: 'describir',
      titulo: 'Describí y dibujá',
      resumen: 'Uno ve una figura y la describe sin nombrarla. El resto dibuja a ciegas.',
      abrir: () => setVista('describir'),
    },
    {
      id: 'simultaneo',
      titulo: 'Todos a la vez',
      resumen:
        'Cada uno recibe su consigna en secreto, dibujan al mismo tiempo y después adivinan qué dibujó el otro.',
      abrir: () => {
        nuevaRonda()
        setVista('simultaneo')
      },
    },
    {
      id: 'emojis',
      titulo: 'Dibujá los emojis',
      resumen: 'Tres emojis aparecen tres segundos y desaparecen. A dibujarlos de memoria, en orden.',
      abrir: () => {
        setFaseE('espera')
        setVista('emojis')
      },
    },
    {
      id: 'futbol',
      titulo: '⚽ Fútbol emoji',
      resumen: 'Tres emojis, un futbolista. El primero que lo grite se lleva el punto.',
      abrir: () => {
        otroFutbolista()
        setVista('futbol')
      },
    },
    ...Object.entries(TEMATICOS).map(([id, t]) => ({
      id: `tema-${id}`,
      titulo: t.titulo,
      resumen: t.resumen,
      abrir: () => {
        setTema(id)
        setVista('tematico')
      },
    })),
  ]

  const activos = JUEGOS.filter((j) => !archivados.includes(j.id))
  const guardados = JUEGOS.filter((j) => archivados.includes(j.id))

  const cambiarEstado = (id: string, estado: 'activo' | 'archivado') => {
    const next =
      estado === 'archivado'
        ? [...archivados.filter((x) => x !== id), id]
        : archivados.filter((x) => x !== id)
    setArchivados(next)
    saveArchivados(next)
    setMenuAbierto(null)
    // Si vaciaste el archivo, no tiene sentido quedarse mirándolo
    if (next.length === 0) setVista('menu')
  }

  const tarjeta = (j: (typeof JUEGOS)[number], num: number) => (
    <div className="jp-card-wrap" key={j.id}>
      <button type="button" className="jp-card" onClick={j.abrir}>
        <span className="jp-num">{String(num).padStart(2, '0')}</span>
        <span className="jp-card-titulo">{j.titulo}</span>
        <span className="jp-card-txt">{j.resumen}</span>
      </button>
      <button
        type="button"
        className="jp-puntos"
        title="Estado del juego"
        aria-label={`Estado de ${j.titulo}`}
        aria-expanded={menuAbierto === j.id}
        onClick={() => setMenuAbierto((m) => (m === j.id ? null : j.id))}
      >
        ⋯
      </button>
      {menuAbierto === j.id && (
        <div className="jp-estado-menu">
          {(['activo', 'archivado'] as const).map((e) => {
            const esteEstado = archivados.includes(j.id) ? 'archivado' : 'activo'
            return (
              <button
                type="button"
                key={e}
                className={esteEstado === e ? 'is-actual' : ''}
                onClick={() => cambiarEstado(j.id, e)}
              >
                <span>{e === 'activo' ? 'Activo' : 'Archivado'}</span>
                {esteEstado === e && <span className="jp-tilde">✓</span>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )

  if (vista === 'menu' || vista === 'archivados') {
    const enArchivo = vista === 'archivados'
    const lista = enArchivo ? guardados : activos
    return (
      <>
        <header className="crm-header">
          {enArchivo ? (
            <button
              type="button"
              className="btn-ghost jp-volver"
              onClick={() => {
                setMenuAbierto(null)
                setVista('menu')
              }}
            >
              ← Todos los juegos
            </button>
          ) : (
            <h1>Juegos de papel</h1>
          )}
        </header>
        {enArchivo ? (
          <h2 className="jp-titulo">Juegos archivados</h2>
        ) : (
          <p className="conv-nota jp-bajada">
            Juegos para una mesa con hojas y lápices. La pantalla solo reparte consignas y
            controla el tiempo.
          </p>
        )}

        {/* Un clic afuera cierra el menú de estado abierto */}
        <div className="jp-menu" onClick={(e) => e.target === e.currentTarget && setMenuAbierto(null)}>
          {lista.map((j, i) => tarjeta(j, i + 1))}

          {enArchivo && lista.length === 0 && (
            <p className="conv-nota">
              No archivaste ninguno. Usá los tres puntos de cada juego para sacarlo del menú
              sin perderlo.
            </p>
          )}

          {!enArchivo && guardados.length > 0 && (
            <button
              type="button"
              className="jp-card jp-card-archivo"
              onClick={() => {
                setMenuAbierto(null)
                setVista('archivados')
              }}
            >
              <span className="jp-num">🗂️</span>
              <span className="jp-card-titulo">Juegos archivados</span>
              <span className="jp-card-txt">
                {guardados.length} guardado{guardados.length === 1 ? '' : 's'}:{' '}
                {guardados.map((g) => g.titulo).join(', ')}
              </span>
            </button>
          )}
        </div>

        {!enArchivo && <Marcador jugadores={jugadores} guardar={guardarJugadores} />}
      </>
    )
  }

  return (
    <>
      <header className="crm-header">
        <button type="button" className="btn-ghost jp-volver" onClick={() => setVista('menu')}>
          ← Todos los juegos
        </button>
      </header>

      {vista === 'garabato' && (
        <section className="jp-hoja">
          <h2 className="jp-titulo">Garabato</h2>
          <p className="jp-sub">Mismo trazo para todos: cada uno lo convierte en otra cosa.</p>

          <div className="jp-etiqueta">Dificultad</div>
          <div className="filtros">
            {[1, 2, 3].map((d) => (
              <button
                type="button"
                key={d}
                className={chip(dif === d)}
                onClick={() => {
                  setDif(d)
                  setSemillaG(nuevaSemilla())
                }}
              >
                {['suave', 'normal', 'caos'][d - 1]}
              </button>
            ))}
          </div>

          <div className="jp-lienzo">
            <svg viewBox={`0 0 ${garabato.W} ${garabato.H}`} role="img" aria-label="Garabato">
              <path
                d={garabato.d}
                fill="none"
                stroke="currentColor"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="jp-codigo">garabato n.º {semillaG}</div>

          <div className="jp-acciones">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setSemillaG(nuevaSemilla())
                setDispG((d) => d + 1)
              }}
            >
              Otro garabato
            </button>
          </div>

          <Cronometro disparo={dispG} />
          <Marcador jugadores={jugadores} guardar={guardarJugadores} />
        </section>
      )}

      {vista === 'memoria' && (
        <JuegoConsignas
          titulo="De memoria"
          sub="Sin mirar nada ni a nadie. Después comparan y se ríen."
          banco={BANCO}
          nombres={NOMBRE_CAT}
          jugadores={jugadores}
          guardar={guardarJugadores}
        />
      )}

      {vista === 'bloque' && (
        <section className="jp-hoja">
          <LuzBorde tipo={luzBloque} />
          <h2 className="jp-titulo">
            {tipoBloque === 'emojis' ? 'Bloque de emojis' : 'Bloque de cosas'}
          </h2>
          <p className="jp-sub">
            Una tanda cerrada: {bloqueTam} {tipoBloque === 'emojis' ? 'emojis' : 'cosas'},{' '}
            {segBloque} segundo{segBloque === 1 ? '' : 's'} cada uno. Al final aparecen todos
            juntos.
          </p>

          {!corriendoBloque && !terminadoBloque && (
            <>
              {tipoBloque === 'cosas' && <div className="jp-etiqueta">Nivel</div>}
              <div className="filtros" hidden={tipoBloque === 'emojis'}>
                {NIVELES_BLOQUE.map((n) => (
                  <button
                    type="button"
                    key={n.id}
                    className={chip(nivelBloque === n.id)}
                    onClick={() => setNivelBloque(n.id)}
                  >
                    {n.nombre}
                  </button>
                ))}
              </div>

              <div className="jp-etiqueta">
                Cuántos {tipoBloque === 'emojis' ? 'emojis' : 'cosas'}
              </div>
              <div className="filtros">
                {[12, 24].map((n) => (
                  <button
                    type="button"
                    key={n}
                    className={chip(bloqueTam === n)}
                    onClick={() => setBloqueTam(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>

              <div className="jp-etiqueta">Segundos por cosa</div>
              <div className="jp-reloj">
                <div className="jp-reloj-fila">
                  <button
                    type="button"
                    className="jp-mini"
                    aria-label="Menos tiempo"
                    disabled={segBloque <= 1}
                    onClick={() => setSegBloque((s) => Math.max(1, s - 1))}
                  >
                    −
                  </button>
                  <span className="jp-digitos">{segBloque}s</span>
                  <button
                    type="button"
                    className="jp-mini"
                    aria-label="Más tiempo"
                    onClick={() => setSegBloque((s) => Math.min(120, s + 1))}
                  >
                    +
                  </button>
                  <button type="button" className="btn btn-primary" onClick={empezarBloque}>
                    Empezar
                  </button>
                </div>
              </div>
            </>
          )}

          {corriendoBloque && (
            <>
              <div className="jp-consigna jp-rafaga">
                <BotonSonido />
                <div className="jp-consigna-cat">
                  {idxBloque + 1} de {listaBloque.length}
                </div>
                <div
                  className={`jp-consigna-txt ${
                    tipoBloque === 'emojis'
                      ? 'jp-emoji-grande'
                      : claseLargo(listaBloque[idxBloque])
                  }`}
                >
                  {listaBloque[idxBloque]}
                </div>
                <div className={`jp-rafaga-seg ${restaBloque <= 3 ? 'is-poco' : ''}`}>
                  {restaBloque}s
                </div>
              </div>
              <div className="jp-barra">
                <i
                  className={restaBloque <= 3 ? 'is-poco' : ''}
                  style={{ width: `${(restaBloque / segBloque) * 100}%` }}
                />
              </div>
              <div className="jp-acciones">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setPausaBloque((p) => !p)}
                >
                  {pausaBloque ? 'Seguir' : 'Pausar'}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setIdxBloque((i) => Math.min(listaBloque.length - 1, i + 1))
                    setRestaBloque(segBloque)
                    tic()
                  }}
                >
                  Saltar
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setCorriendoBloque(false)
                    setPausaBloque(false)
                    setTerminadoBloque(true)
                  }}
                >
                  Cortar acá
                </button>
              </div>
            </>
          )}

          {terminadoBloque && (
            <>
              <div className="jp-etiqueta">
                {reveladasBloque.length === listaBloque.length
                  ? `Los ${listaBloque.length} del bloque`
                  : `Tocá para ir descubriendo · ${reveladasBloque.length} de ${listaBloque.length}`}
              </div>
              <ol className="jp-bloque-grid">
                {listaBloque.map((c, i) => {
                  const abierta = reveladasBloque.includes(i)
                  return (
                    <li key={i}>
                      <button
                        type="button"
                        className={`jp-bloque-celda ${abierta ? 'is-abierta' : ''}`}
                        onClick={() =>
                          setReveladasBloque((r) => (r.includes(i) ? r : [...r, i]))
                        }
                      >
                        <span className="jp-bloque-num">{i + 1}</span>
                        <span
                          className={`jp-bloque-txt ${
                            tipoBloque === 'emojis' ? 'jp-bloque-emoji' : ''
                          }`}
                        >
                          {c}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ol>
              <div className="jp-acciones">
                {reveladasBloque.length < listaBloque.length && (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setReveladasBloque(listaBloque.map((_, i) => i))}
                  >
                    Revelar todas
                  </button>
                )}
                <button type="button" className="btn btn-primary" onClick={empezarBloque}>
                  Otro bloque
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setTerminadoBloque(false)
                    setListaBloque([])
                  }}
                >
                  Cambiar ajustes
                </button>
              </div>
            </>
          )}

          <Marcador jugadores={jugadores} guardar={guardarJugadores} />
        </section>
      )}

      {vista === 'cosas101' && (
        <section className="jp-hoja">
          <LuzBorde tipo={luzCosas} />
          <h2 className="jp-titulo">Cosas 101</h2>
          <p className="jp-sub">
            Cosas fáciles, una atrás de otra. Cuando se acaba el tiempo cambia sola: no hay
            tiempo para pensarla.
          </p>

          <div className="jp-consigna jp-rafaga">
            <div className="jp-esquina">
              <BotonVoz />
              <BotonSonido />
            </div>
            <div className="jp-consigna-cat">
              {rondaCosas ? `dibujo ${rondaCosas}` : 'listos'}
            </div>
            <div className={`jp-consigna-txt ${claseLargo(cosa)}`}>
              {cosa ?? 'Tocá empezar'}
            </div>
            <div className={`jp-rafaga-seg ${restaCosa <= 3 && corriendo ? 'is-poco' : ''}`}>
              {corriendo || cosa ? restaCosa : segCosa}s
            </div>
          </div>

          <div className="jp-barra">
            <i
              className={restaCosa <= 3 && corriendo ? 'is-poco' : ''}
              style={{ width: `${(restaCosa / segCosa) * 100}%` }}
            />
          </div>

          <div className="jp-reloj">
            <div className="jp-reloj-fila">
              <button
                type="button"
                className="jp-mini"
                aria-label="Menos tiempo"
                disabled={segCosa <= 5 || corriendo}
                onClick={() => {
                  const n = Math.max(5, segCosa - 5)
                  setSegCosa(n)
                  setRestaCosa(n)
                }}
              >
                −
              </button>
              <span className="jp-digitos">{segCosa}s</span>
              <button
                type="button"
                className="jp-mini"
                aria-label="Más tiempo"
                disabled={corriendo}
                onClick={() => {
                  const n = Math.min(120, segCosa + 5)
                  setSegCosa(n)
                  setRestaCosa(n)
                }}
              >
                +
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  if (!corriendo) {
                    despertarVoz()
                    if (!cosa) siguienteCosa()
                    setLuzCosas('verde')
                    setTimeout(() => setLuzCosas(null), 1700)
                  }
                  setCorriendo((c) => !c)
                }}
              >
                {corriendo ? 'Pausar' : cosa ? 'Seguir' : 'Empezar'}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  pitido()
                  siguienteCosa()
                }}
              >
                Saltar
              </button>
            </div>
          </div>

          <Marcador jugadores={jugadores} guardar={guardarJugadores} />
        </section>
      )}

      {vista === 'futbol' && (
        <section className="jp-hoja">
          <h2 className="jp-titulo">⚽ Fútbol emoji</h2>
          <p className="jp-sub">
            Tres pistas por jugador: bandera, apodo, manías. El primero que acierta, punto.
          </p>

          <div className="jp-lienzo jp-emojis">
            <div className="jp-emoji-fila jp-futbol-emojis">
              {futbolista?.e.split(' ').map((e, i) => (
                <span key={i}>{e}</span>
              ))}
            </div>
          </div>

          <div className="jp-consigna jp-futbol-nombre">
            {nombreVisible ? (
              <>
                <div className="jp-consigna-cat">era</div>
                <div className={`jp-consigna-txt ${claseLargo(futbolista?.n)}`}>
                  {futbolista?.n}
                </div>
              </>
            ) : (
              <div className="jp-consigna-txt jp-tapado">¿Quién es?</div>
            )}
          </div>

          <div className="jp-acciones">
            {nombreVisible ? (
              <button type="button" className="btn btn-primary" onClick={otroFutbolista}>
                Siguiente
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setNombreVisible(true)}
              >
                Revelar
              </button>
            )}
            <button type="button" className="btn btn-ghost" onClick={otroFutbolista}>
              Paso
            </button>
          </div>

          <Cronometro disparo={dispF} />
          <Marcador jugadores={jugadores} guardar={guardarJugadores} />
        </section>
      )}

      {vista === 'tematico' && tema && (
        <JuegoConsignas
          key={tema}
          titulo={TEMATICOS[tema].titulo}
          sub={TEMATICOS[tema].sub}
          banco={TEMATICOS[tema].banco}
          nombres={TEMATICOS[tema].nombres}
          jugadores={jugadores}
          guardar={guardarJugadores}
        />
      )}

      {vista === 'describir' && (
        <section className="jp-hoja">
          <h2 className="jp-titulo">Describí y dibujá</h2>
          <p className="jp-sub">Solo formas, tamaños y posiciones. Prohibido decir a qué se parece.</p>

          <div className="jp-etiqueta">Cuántas formas</div>
          <div className="filtros">
            {[3, 5, 8].map((n) => (
              <button
                type="button"
                key={n}
                className={chip(formas === n)}
                onClick={() => {
                  setFormas(n)
                  setSemillaF(nuevaSemilla())
                  setTapada(true)
                }}
              >
                {n} · {['suave', 'normal', 'caos'][[3, 5, 8].indexOf(n)]}
              </button>
            ))}
          </div>

          <div className="jp-lienzo">
            <div dangerouslySetInnerHTML={{ __html: figuraSvg(semillaF, formas) }} />
            {tapada && (
              <div className="jp-escudo">
                <strong>Solo mira quien describe</strong>
                <span>Girá la pantalla antes de destapar.</span>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setTapada(false)
                    setDispF((d) => d + 1)
                  }}
                >
                  Destapar figura
                </button>
              </div>
            )}
          </div>
          <div className="jp-codigo">
            figura F-{semillaF} · {formas} formas
          </div>

          <div className="jp-acciones">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setSemillaF(nuevaSemilla())
                setTapada(true)
              }}
            >
              Figura nueva
            </button>
            {!tapada && (
              <button type="button" className="btn btn-ghost" onClick={() => setTapada(true)}>
                Tapar
              </button>
            )}
          </div>

          <Cronometro disparo={dispFut} />
          <Marcador jugadores={jugadores} guardar={guardarJugadores} />
        </section>
      )}

      {vista === 'simultaneo' && (
        <section className="jp-hoja">
          <h2 className="jp-titulo">Todos a la vez</h2>

          {fase === 'reparto' && (
            <>
              <p className="jp-sub">
                Pasá el teléfono. Cada uno mira su consigna sin que nadie más la vea.
              </p>
              <div className="jp-consigna jp-secreto">
                <div className="jp-consigna-cat">
                  {turno + 1} de {jugadores.length}
                </div>
                {verConsigna ? (
                  <>
                    <div className={`jp-consigna-txt ${claseLargo(consignas[turno])}`}>
                      {consignas[turno]}
                    </div>
                    <p className="jp-aviso">Memorizala y pasá el teléfono.</p>
                  </>
                ) : (
                  <div className="jp-consigna-txt">Turno de {jugadores[turno]?.nombre}</div>
                )}
              </div>

              <div className="jp-acciones">
                {verConsigna ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      setVerConsigna(false)
                      if (turno + 1 < jugadores.length) setTurno(turno + 1)
                      else {
                        setFase('dibujo')
                        setDispS((d) => d + 1)
                      }
                    }}
                  >
                    {turno + 1 < jugadores.length ? 'Listo, siguiente' : 'Listo, a dibujar'}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setVerConsigna(true)}
                  >
                    Ver mi consigna
                  </button>
                )}
              </div>
            </>
          )}

          {fase === 'dibujo' && (
            <>
              <p className="jp-sub">
                Todos dibujan al mismo tiempo, cada uno lo suyo. Sin espiar, sin hablar.
              </p>
              <Cronometro disparo={dispS} />
              <div className="jp-acciones">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setFase('adivinar')}
                >
                  Terminamos, a adivinar
                </button>
              </div>
            </>
          )}

          {fase === 'adivinar' && (
            <>
              <p className="jp-sub">
                Uno muestra su dibujo, el resto tira. Después revelás y sumás punto al que acertó
                (y al dibujante si alguien le acertó).
              </p>
              <ul className="jp-revelar">
                {jugadores.map((j, i) => (
                  <li key={i} className="jp-revelar-fila">
                    <span className="jp-revelar-nombre">{j.nombre}</span>
                    {revelado.includes(i) ? (
                      <span className="jp-revelar-txt">{consignas[i]}</span>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => setRevelado([...revelado, i])}
                      >
                        Revelar
                      </button>
                    )}
                  </li>
                ))}
              </ul>
              <div className="jp-acciones">
                <button type="button" className="btn btn-primary" onClick={nuevaRonda}>
                  Ronda nueva
                </button>
              </div>
            </>
          )}

          <Marcador jugadores={jugadores} guardar={guardarJugadores} />
        </section>
      )}

      {vista === 'emojis' && (
        <section className="jp-hoja">
          <h2 className="jp-titulo">Dibujá los emojis</h2>
          <p className="jp-sub">
            {faseE === 'espera' &&
              `${cantEmojis} emoji${cantEmojis === 1 ? '' : 's'}, tres segundos. Después ${
                cantEmojis === 1 ? 'lo dibujan' : 'los dibujan'
              } de memoria.`}
            {faseE === 'cuenta' && 'Ojos en la pantalla…'}
            {faseE === 'mostrando' && '¡Miralos bien!'}
            {faseE === 'dibujando' &&
              (cantEmojis === 1 ? 'Se fue. A dibujarlo de memoria.' : 'Se fueron. A dibujarlos todos, en orden.')}
          </p>

          {(faseE === 'espera' || faseE === 'dibujando') && (
            <div className="jp-reloj">
              <div className="jp-reloj-fila">
                <span className="jp-etiqueta jp-etiqueta-inline">Cuántos a la vez</span>
                <button
                  type="button"
                  className="jp-mini"
                  aria-label="Menos emojis"
                  disabled={cantEmojis <= 1}
                  onClick={() => setCantEmojis((n) => Math.max(1, n - 1))}
                >
                  −
                </button>
                <span className="jp-digitos jp-digitos-chico">{cantEmojis}</span>
                <button
                  type="button"
                  className="jp-mini"
                  aria-label="Más emojis"
                  disabled={cantEmojis >= 10}
                  onClick={() => setCantEmojis((n) => Math.min(10, n + 1))}
                >
                  +
                </button>
              </div>
            </div>
          )}

          <div className="jp-lienzo jp-emojis">
            {faseE === 'espera' && <span className="jp-emoji-espera">👀</span>}
            {faseE === 'cuenta' && <span className="jp-cuenta">{cuentaE}</span>}
            {(faseE === 'mostrando' || repaso) && (
              <div className="jp-emoji-fila">
                {emojis.map((e, i) => (
                  <span key={i}>{e}</span>
                ))}
              </div>
            )}
            {faseE === 'dibujando' && !repaso && <span className="jp-emoji-espera">✏️</span>}
            {faseE === 'mostrando' && <div className="jp-barra jp-barra-expo" />}
          </div>

          <div className="jp-acciones">
            {faseE === 'dibujando' ? (
              <>
                <button type="button" className="btn btn-primary" onClick={rondaEmojis}>
                  Otra ronda
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setRepaso((r) => !r)}
                >
                  {repaso ? 'Ocultar' : 'Ver cuáles eran'}
                </button>
              </>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                disabled={faseE !== 'espera'}
                onClick={rondaEmojis}
              >
                {faseE === 'espera' ? 'Mostrar emojis' : 'Atenti…'}
              </button>
            )}
          </div>

          <Cronometro disparo={dispE} />
          <Marcador jugadores={jugadores} guardar={guardarJugadores} />
        </section>
      )}
    </>
  )
}
