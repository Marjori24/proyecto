//***********Grafico 01********************/

// Se selecciona los objetos en el html
const grafAsalariados = d3.select("#grafAsalariados")
const cboRangoAnios = d3.select("#cboRangoAnios")

// Se calculan las dimensiones del espacio de #grafAsalariados
const anchoTotal = +grafAsalariados.style("width").slice(0, -2)
const altoTotal = (anchoTotal * 9) / 20
const margins = {
  top: 60,
  right: 20,
  bottom: 75,
  left: 100,
}
const ancho = anchoTotal - margins.left - margins.right
const alto = altoTotal - margins.top - margins.bottom

// Se agrega como atributos el ancho y altura para #grafAsalariados
const svg = grafAsalariados
  .append("svg")
  .attr("width", anchoTotal)
  .attr("height", altoTotal)
  .attr("class", "grafAsalariados")

// Se agrega atributos al componente de paleta de dibujo SGV
const layer = svg
  .append("g")
  .attr("transform", `translate(${margins.left}, ${margins.top})`)

// Area del grfico de coordinadas
layer
  .append("rect")
  .attr("height", alto)
  .attr("width", ancho)
  .attr("fill", "white")

// Agregando atributos a componente G
const g = svg
  .append("g")
  .attr("transform", `translate(${margins.left}, ${margins.top})`)

// Función asincrona para dibujar 
const draw = async (variable = "De 16 a 24 anios") => {
  // Carga de Datos
  data = await d3.csv("input/porcentaje_de_asalariados_con_contratos_temporales_por_edad.csv", d3.autoType)

  // Se carga las opciones del combobox
  cboRangoAnios
    .selectAll("option")
    .data(Object.keys(data[0]).slice(1))
    .enter()
    .append("option")
    .attr("value", (d) => d)
    .text((d) => d)

  // Se calcula accesor X
  const xAccessor = (d) => d.Anio

  // Se calculan escaladores
  const y = d3.scaleLinear().range([alto, 0])
  const color = d3
    .scaleOrdinal()
    .domain(Object.keys(data[0]).slice(1))
    .range(d3.schemeTableau10)

  const x = d3.scaleBand().range([0, ancho]).paddingOuter(0.2).paddingInner(0.1)

  // Se agrega objeto text para el titulo del gráfico
  const titulo = g
    .append("text")
    .attr("x", ancho / 2)
    .attr("y", -15)
    .classed("titulo", true)

  const etiquetas = g.append("g")

  const xAxisGroup = g
    .append("g")
    .attr("transform", `translate(0, ${alto})`)
    .classed("axis", true)
  const yAxisGroup = g.append("g").classed("axis", true)

  // Constante que procesa lo que se va a mostrar de acuerdo a la variable que se escoga en el combobox 
  const render = (variable) => {
    // Se calcula accesor Y
    const yAccessor = (d) => d[variable]

    // Se calculan escaladores para coordenada X e Y
    y.domain([0, d3.max(data, yAccessor)])
    x.domain(d3.map(data, xAccessor))

    // Se dibujan las barras del gráfico
    const rect = g.selectAll("rect").data(data, xAccessor)
    rect
      .enter()
      .append("rect")
      .attr("x", (d) => x(xAccessor(d)))
      .attr("y", (d) => y(0))
      .attr("width", x.bandwidth())
      .attr("height", 0)
      .attr("fill", "green")
      .merge(rect)
      .transition()
      .duration(2500)
      .attr("x", (d) => x(xAccessor(d)))
      .attr("y", (d) => y(yAccessor(d)))
      .attr("width", x.bandwidth())
      .attr("height", (d) => alto - y(yAccessor(d)))
      .attr("fill", (d) =>
        xAccessor(d) == "2018" ? "yellow" : color(variable)
      )

    // Se agrega y cargan las etiquetas a cada barra
    const et = etiquetas.selectAll("text").data(data)
    et.enter()
      .append("text")
      .attr("x", (d) => x(xAccessor(d)) + x.bandwidth() / 2)
      .attr("y", (d) => y(0))
      .merge(et)
      .transition()
      .duration(2500)
      .attr("x", (d) => x(xAccessor(d)) + x.bandwidth() / 2)
      .attr("y", (d) => y(yAccessor(d)))
      .text(yAccessor)
      .attr("class", "etiquetaBarra")

    // Se agrega el titulo del grafico de acuerdo a la variable
    titulo.text(`En el rango: ${variable} `)

    // Se carga la transision de la carga de las coordenadas del grafico de barras
    const xAxis = d3.axisBottom(x)
    const yAxis = d3.axisLeft(y).ticks(8)
    xAxisGroup.transition().duration(2500).call(xAxis)
    yAxisGroup.transition().duration(2500).call(yAxis)
  }

  // Evento para el cambio de opciones del combobox y actualizar las barras del grafico
  cboRangoAnios.on("change", (e) => {
    e.preventDefault()
    render(e.target.value)
  })
  render(variable)
}

// S
draw()