import { useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react'
import './Schedule.css'

/* ---------- Constantes ---------- */

const TIPOS = [
  { id: 'aula', rotulo: 'Aula' },
  { id: 'chamada', rotulo: 'Chamada' },
  { id: 'entrega', rotulo: 'Entrega' },
  { id: 'prova', rotulo: 'Prova' },
]

const ROTULO_POR_TIPO = Object.fromEntries(TIPOS.map((tipo) => [tipo.id, tipo.rotulo]))

const formatoDiaSemana = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' })
const formatoDiaMesCurto = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short' })
const formatoMesLongo = new Intl.DateTimeFormat('pt-BR', { month: 'long' })

/* ---------- Utilitários de data ---------- */

// Semana começa na segunda-feira
function inicioDaSemana(data) {
  const d = new Date(data)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return d
}

function somarDias(data, dias) {
  const d = new Date(data)
  d.setDate(d.getDate() + dias)
  return d
}

// Chave local "AAAA-MM-DD" (evita o deslocamento de fuso do toISOString)
function chaveDoDia(data) {
  const ano = data.getFullYear()
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

function formatarPeriodo(primeiro, ultimo) {
  const ano = ultimo.getFullYear()
  if (primeiro.getMonth() === ultimo.getMonth()) {
    return `${primeiro.getDate()} a ${ultimo.getDate()} de ${formatoMesLongo.format(ultimo)} de ${ano}`
  }
  return `${formatoDiaMesCurto.format(primeiro)} a ${formatoDiaMesCurto.format(ultimo)} de ${ano}`
}

/* ---------- Dados de exemplo (trocar pela API depois) ---------- */

function gerarEventosExemplo() {
  const segunda = inicioDaSemana(new Date())
  const criar = (deslocamento, tipo, titulo, inicio, fim, local) => ({
    id: `${deslocamento}-${inicio}-${titulo}`,
    data: chaveDoDia(somarDias(segunda, deslocamento)),
    tipo,
    titulo,
    inicio,
    fim,
    local,
  })

// Dados Teste
  return [
    criar(0, 'aula', 'Introdução ao React', '19:00', '20:30', 'Sala 1'),
    criar(0, 'entrega', 'Lista de exercícios de JavaScript', '23:59', null, 'Plataforma'),
    criar(1, 'chamada', 'Dúvidas de HTML e CSS', '20:00', '21:00', 'Discord'),
    criar(2, 'aula', 'Node.js e Express', '19:00', '20:30', 'Sala 2'),
    criar(3, 'chamada', 'Mentoria em grupo', '19:30', '20:30', 'Discord'),
    criar(3, 'prova', 'Quiz de JavaScript', '21:00', '21:40', 'Online'),
    criar(4, 'entrega', 'Projeto: lista de tarefas', '23:59', null, 'GitHub'),
    criar(5, 'aula', 'Workshop de Git', '10:00', '12:00', 'Auditório'),
  ]
}


/**
 * @param {Object}   props
 * @param {Array}    [props.eventos]  [{ id, data: 'AAAA-MM-DD', tipo, titulo, inicio: 'HH:MM', fim?, local? }]
 * @param {Function} [props.onSelecionarEvento]  recebe o evento clicado
 */
export default function Schedule({ eventos, onSelecionarEvento }) {
  const [inicioSemana, setInicioSemana] = useState(() => inicioDaSemana(new Date()))
  const [tiposAtivos, setTiposAtivos] = useState(() => new Set(TIPOS.map((tipo) => tipo.id)))
  const arraste = useRef(null)

  const lista = useMemo(() => eventos ?? gerarEventosExemplo(), [eventos])

  const dias = useMemo(
    () => Array.from({ length: 7 }, (_, indice) => somarDias(inicioSemana, indice)),
    [inicioSemana],
  )

  const eventosPorDia = useMemo(() => {
    const mapa = new Map()
    lista
      .filter((evento) => tiposAtivos.has(evento.tipo))
      .sort((a, b) => a.inicio.localeCompare(b.inicio))
      .forEach((evento) => {
        mapa.set(evento.data, [...(mapa.get(evento.data) ?? []), evento])
      })
    return mapa
  }, [lista, tiposAtivos])

  const chaveHoje = chaveDoDia(new Date())

  function mudarSemana(deslocamento) {
    setInicioSemana((atual) => somarDias(atual, deslocamento * 7))
  }

  function irParaHoje() {
    setInicioSemana(inicioDaSemana(new Date()))
  }

  function alternarTipo(id) {
    setTiposAtivos((atual) => {
      const proximo = new Set(atual)
      if (proximo.has(id)) proximo.delete(id)
      else proximo.add(id)
      return proximo
    })
  }

  function iniciarArraste(event) {
    if (event.button !== 0) return

    const semana = event.currentTarget
    arraste.current = {
      inicioX: event.clientX,
      scrollInicial: semana.scrollLeft,
    }
    semana.setPointerCapture(event.pointerId)
  }

  function arrastar(event) {
    const semana = event.currentTarget
    const estado = arraste.current
    if (!estado) return

    semana.scrollLeft = estado.scrollInicial - (event.clientX - estado.inicioX)
  }

  function finalizarArraste(event) {
    arraste.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  return (
    <section className="cronograma" aria-labelledby="cronograma-titulo">
      <header className="cronograma__cabecalho">
        <div className="cronograma__titulo-grupo">
          <h2 id="cronograma-titulo" className="cronograma__titulo">
            Cronograma
          </h2>
          <p className="cronograma__periodo">{formatarPeriodo(dias[0], dias[6])}</p>
        </div>

        <div className="cronograma__navegacao">
          <button
            type="button"
            className="cronograma__botao cronograma__botao--icone"
            onClick={() => mudarSemana(-1)}
            aria-label="Semana anterior"
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <button type="button" className="cronograma__botao" onClick={irParaHoje}>
            Hoje
          </button>
          <button
            type="button"
            className="cronograma__botao cronograma__botao--icone"
            onClick={() => mudarSemana(1)}
            aria-label="Próxima semana"
          >
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        </div>
      </header>

      <ul className="cronograma__filtros" aria-label="Filtrar por tipo de atividade">
        {TIPOS.map((tipo) => (
          <li key={tipo.id}>
            <button
              type="button"
              className={`cronograma__filtro cronograma__filtro--${tipo.id}`}
              aria-pressed={tiposAtivos.has(tipo.id)}
              onClick={() => alternarTipo(tipo.id)}
            >
              <span className="cronograma__filtro-marca" aria-hidden="true" />
              {tipo.rotulo}
            </button>
          </li>
        ))}
      </ul>

      <div
        className="cronograma__semana"
        onPointerDown={iniciarArraste}
        onPointerMove={arrastar}
        onPointerUp={finalizarArraste}
        onPointerCancel={finalizarArraste}
      >
        {dias.map((dia) => {
          const chave = chaveDoDia(dia)
          const eventosDoDia = eventosPorDia.get(chave) ?? []
          const ehHoje = chave === chaveHoje

          return (
            <article
              key={chave}
              className={`cronograma__dia${ehHoje ? ' cronograma__dia--hoje' : ''}`}
              aria-current={ehHoje ? 'date' : undefined}
            >
              <header className="cronograma__dia-cabecalho">
                <div>
                  <span className="cronograma__dia-semana">
                    {formatoDiaSemana.format(dia).replace('.', '')}
                  </span>
                  <strong className="cronograma__dia-numero">{dia.getDate()}</strong>
                </div>
                <span
                  className="cronograma__dia-contagem"
                  aria-label={`${eventosDoDia.length} atividades`}
                >
                  {eventosDoDia.length}
                </span>
              </header>

              <ul className="cronograma__eventos">
                {eventosDoDia.length === 0 ? (
                  <li className="cronograma__vazio">Sem atividades</li>
                ) : (
                  eventosDoDia.map((evento) => (
                    <li key={evento.id}>
                      <button
                        type="button"
                        className={`cronograma__evento cronograma__evento--${evento.tipo}`}
                        onClick={() => onSelecionarEvento?.(evento)}
                      >
                        <span className="cronograma__evento-tipo">
                          {ROTULO_POR_TIPO[evento.tipo] ?? evento.tipo}
                        </span>
                        <strong className="cronograma__evento-titulo">{evento.titulo}</strong>
                        <span className="cronograma__evento-info">
                          <Clock size={14} aria-hidden="true" />
                          {evento.fim ? `${evento.inicio} às ${evento.fim}` : `até ${evento.inicio}`}
                        </span>
                        {evento.local && (
                          <span className="cronograma__evento-info">
                            <MapPin size={14} aria-hidden="true" />
                            {evento.local}
                          </span>
                        )}
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </article>
          )
        })}
      </div>
    </section>
  )
}