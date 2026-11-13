// Configuración de datos de contacto centralizada
const CONTACT_EMAIL = "pmunozms7@outlook.com"; // Cambiar por tu correo de contacto principal
const CONTACT_WHATSAPP = "51931697778";
const CONTACT_LINKEDIN = "https://www.linkedin.com/in/percy-saul-muñoz-sierra-a1363a302";

const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ==========================================================================
// HIGH PERFORMANCE CANVAS ENGINE (CACHED DIMENSIONS & OBSERVERS - 60 FPS)
// ==========================================================================

let isModelCanvasVisible = false;
let modelCanvasState = null;

function setupModelCanvas() {
  const canvas = document.getElementById("modelCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let w = 0;
  let h = 0;

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = rect.width;
    h = rect.height;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  // Redimensionar solo cuando el contenedor cambie de tamaño
  if (window.ResizeObserver) {
    const ro = new ResizeObserver(() => resize());
    ro.observe(canvas);
  } else {
    window.addEventListener("resize", resize, { passive: true });
  }
  resize();

  // Pausar renderizado cuando el método esté fuera de pantalla
  const metodoSection = document.getElementById("metodo");
  if (metodoSection && window.IntersectionObserver) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        isModelCanvasVisible = entry.isIntersecting;
        if (isModelCanvasVisible) {
          requestAnimationFrame(drawLoop);
        }
      });
    }, { threshold: 0.05 });
    io.observe(metodoSection);
  } else {
    isModelCanvasVisible = true;
  }

  function drawModelPanel(time) {
    if (!canvas.offsetParent || w === 0 || h === 0) return;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#071224";
    ctx.fillRect(0, 0, w, h);

    const left = Math.max(72, Math.min(84, Math.floor(w * 0.16)));
    const right = w - 24;
    const top = 32;
    const bottom = h - 44;
    const plotW = Math.max(10, right - left);
    const plotH = Math.max(10, bottom - top);

    // Cuadriculado cartesiano de bandas salariales
    ctx.strokeStyle = "rgba(255, 255, 255, 0.07)";
    ctx.lineWidth = 1;

    // Líneas horizontales de salario (Y)
    const yTicks = [
      { val: "S/. 24,000", ratio: 0.08 },
      { val: "S/. 18,000", ratio: 0.28 },
      { val: "S/. 12,000", ratio: 0.50 },
      { val: "S/. 7,000",  ratio: 0.72 },
      { val: "S/. 3,200",  ratio: 0.92 }
    ];

    ctx.font = "10.5px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = "rgba(226, 232, 240, 0.65)";
    ctx.textAlign = "right";

    yTicks.forEach(tick => {
      const y = top + plotH * tick.ratio;
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(right, y);
      ctx.stroke();
      ctx.fillText(tick.val, left - 10, y + 4);
    });

    // 4 Grados Salariales Estructurados (Metodología Hay / Mercer)
    const grades = [
      { label: "G10: Analistas", short: "G10", role: "Analistas", xPct: 0.14, min: 0.90, mid: 0.78, max: 0.66, color: "#10B981" },
      { label: "G12: Especialistas", short: "G12", role: "Especialistas", xPct: 0.38, min: 0.74, mid: 0.60, max: 0.46, color: "#00A3E0" },
      { label: "G14: Jefaturas", short: "G14", role: "Jefaturas", xPct: 0.62, min: 0.54, mid: 0.40, max: 0.26, color: "#818CF8" },
      { label: "G16: Gerencias", short: "G16", role: "Gerencias", xPct: 0.86, min: 0.34, mid: 0.20, max: 0.06, color: "#38BDF8" }
    ];

    const bandWidth = Math.min(84, Math.floor(plotW * 0.18));

    // Dibujar las 4 bandas salariales rectangulares con Min, Midpoint y Max
    grades.forEach((g) => {
      const cx = left + plotW * g.xPct;
      const bTop = top + plotH * g.max;
      const bBottom = top + plotH * g.min;
      const bHeight = bBottom - bTop;
      const bMid = top + plotH * g.mid;

      // Caja de la banda (rango salarial)
      ctx.fillStyle = "rgba(255, 255, 255, 0.035)";
      ctx.fillRect(cx - bandWidth / 2, bTop, bandWidth, bHeight);

      ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
      ctx.lineWidth = 1;
      ctx.strokeRect(cx - bandWidth / 2, bTop, bandWidth, bHeight);

      // Línea de Midpoint (P50 Mercado) dentro de la banda
      ctx.strokeStyle = g.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx - bandWidth / 2, bMid);
      ctx.lineTo(cx + bandWidth / 2, bMid);
      ctx.stroke();

      // Puntos de colaboradores dentro del grado
      for (let j = 0; j < 8; j++) {
        const jitterX = Math.sin(time * 0.0008 + j * 1.7) * (bandWidth * 0.26);
        const yPct = g.min - (j / 8) * (g.min - g.max) + (Math.cos(j * 3.1) * 0.025);
        const y = top + plotH * yPct;

        ctx.fillStyle = g.color;
        ctx.beginPath();
        ctx.arc(cx + jitterX, y, 3.4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Etiqueta del grado en eje X (con espacio limpio, sin superposición)
      ctx.textAlign = "center";
      if (plotW < 380) {
        ctx.font = "bold 11px 'Plus Jakarta Sans', sans-serif";
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(g.short, cx, bottom + 16);
        ctx.font = "10px 'Plus Jakarta Sans', sans-serif";
        ctx.fillStyle = "rgba(148, 163, 184, 0.85)";
        ctx.fillText(g.role, cx, bottom + 28);
      } else {
        ctx.font = "600 11.5px 'Plus Jakarta Sans', sans-serif";
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(g.label, cx, bottom + 20);
      }
    });

    // Línea conectora de Midpoint de Mercado (Curva de Política Salarial P50)
    ctx.strokeStyle = "#38BDF8";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    grades.forEach((g, idx) => {
      const cx = left + plotW * g.xPct;
      const cy = top + plotH * g.mid;
      if (idx === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // Título del Eje Y (limpio, a la izquierda; la leyenda está en el encabezado HTML)
    ctx.textAlign = "left";
    ctx.font = "600 11px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = "rgba(226, 232, 240, 0.75)";
    ctx.fillText("▲ Remuneración Básica Mensual (S/.)", left, top - 12);

    // Ejes cartesianos
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(left, top);
    ctx.lineTo(left, bottom);
    ctx.lineTo(right, bottom);
    ctx.stroke();
  }

  function drawLoop(time) {
    if (!isModelCanvasVisible) return;
    drawModelPanel(time);
    if (!prefersReduced) {
      requestAnimationFrame(drawLoop);
    }
  }

  modelCanvasState = { resize, drawLoop };
  if (!prefersReduced) {
    requestAnimationFrame(drawLoop);
  }
}

// GESTIÓN DEL CARRUSEL DE PERFIL Y CASOS DE ÉXITO
function setupCarousel() {
  const slides = document.querySelectorAll(".profile-slide");
  const dots = document.querySelectorAll(".profile-dots span, .slider-dot");
  const prevBtn = document.querySelector(".profile-arrow.prev-slide");
  const nextBtn = document.querySelector(".profile-arrow.next-slide");

  if (slides.length <= 1) return;

  let currentIdx = 0;

  function showSlide(index) {
    slides.forEach(slide => slide.classList.remove("active"));
    dots.forEach(dot => {
      dot.classList.remove("active");
      dot.setAttribute("aria-selected", "false");
    });

    // Ajustar límites del índice
    currentIdx = (index + slides.length) % slides.length;

    slides[currentIdx].classList.add("active");
    if (dots[currentIdx]) {
      dots[currentIdx].classList.add("active");
      dots[currentIdx].setAttribute("aria-selected", "true");
    }
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      showSlide(currentIdx - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      showSlide(currentIdx + 1);
    });
  }

  dots.forEach(dot => {
    dot.addEventListener("click", () => {
      const targetIdx = parseInt(dot.getAttribute("data-index"), 10);
      if (!isNaN(targetIdx)) {
        showSlide(targetIdx);
      }
    });
  });
}

// CONTROL DE PESTAÑAS (MÉTODO - GRÁFICO VS SIMULADOR VS MATRIZ EQUIDAD)
function setupTabs() {
  const tabConfigs = [
    {
      btn: document.getElementById("btnShowGraph"),
      tab: document.getElementById("tabGraph"),
      onShow: () => {
        if (modelCanvasState) {
          modelCanvasState.resize();
          requestAnimationFrame(modelCanvasState.drawLoop);
        }
      }
    },
    {
      btn: document.getElementById("btnShowSim"),
      tab: document.getElementById("tabSim")
    },
    {
      btn: document.getElementById("btnShowEquity"),
      tab: document.getElementById("tabEquity")
    }
  ];

  tabConfigs.forEach(({ btn, tab, onShow }) => {
    if (!btn || !tab) return;
    btn.addEventListener("click", () => {
      tabConfigs.forEach(c => {
        if (c.btn && c.tab) {
          c.btn.classList.remove("active");
          c.tab.classList.remove("active");
        }
      });
      btn.classList.add("active");
      tab.classList.add("active");
      if (typeof onShow === "function") {
        onShow();
      }
    });
  });
}

// ALGORITMO Y LÓGICA DEL SIMULADOR DE APLICACIÓN PRESUPUESTARIA
function setupSimulator() {
  const budgetInput = document.getElementById("simBudget");
  const valBudget = document.getElementById("valBudget");
  const btnRunSim = document.getElementById("btnRunSim");
  const strategySelect = document.getElementById("simStrategy");

  if (!budgetInput || !valBudget) return;

  const roles = {
    analyst: { current: 3200, min: 3500, max: 5000, count: 10, genderFemaleCount: 6, genderGap: 250 },
    coordinator: { current: 5100, min: 5500, max: 8000, count: 5, genderFemaleCount: 3, genderGap: 500 },
    head: { current: 8900, min: 9500, max: 13500, count: 3, genderFemaleCount: 1, genderGap: 750 },
    manager: { current: 14300, min: 15000, max: 22000, count: 2, genderFemaleCount: 1, genderGap: 1600 }
  };

  function updateSimulation() {
    const totalBudget = parseInt(budgetInput.value, 10);
    valBudget.textContent = `S/. ${totalBudget.toLocaleString("es-PE")}`;

    const strategy = strategySelect ? strategySelect.value : "market";

    // Cálculos de Incrementos (Simulación de optimización matemática lineal)
    let totalMarketGap = 0;
    let totalGenderGap = 0;

    for (const key in roles) {
      const r = roles[key];
      totalMarketGap += (r.min - r.current) * r.count;
      totalGenderGap += r.genderGap * r.genderFemaleCount;
    }

    const allocations = { analyst: 0, coordinator: 0, head: 0, manager: 0 };
    let benefitedCount = 0;
    let scoreGapClosed = 0;

    if (strategy === "market") {
      if (totalBudget >= totalMarketGap) {
        const extra = totalBudget - totalMarketGap;
        for (const key in roles) {
          const r = roles[key];
          const marketGapTotal = (r.min - r.current) * r.count;
          const extraAllocProduct = extra * (r.count / 20); // total 20 empleados
          allocations[key] = (marketGapTotal + extraAllocProduct) / r.count;
        }
        benefitedCount = 20;
        scoreGapClosed = 100;
      } else {
        const pct = totalBudget / totalMarketGap;
        for (const key in roles) {
          const r = roles[key];
          const marketGapTotal = (r.min - r.current) * r.count;
          allocations[key] = (marketGapTotal * pct) / r.count;
        }
        benefitedCount = Math.round(pct * 20);
        scoreGapClosed = Math.round(pct * 100);
      }
    } else if (strategy === "gender") {
      if (totalBudget >= totalGenderGap) {
        const extra = totalBudget - totalGenderGap;
        for (const key in roles) {
          const r = roles[key];
          const genderAllocation = r.genderGap * r.genderFemaleCount;
          const marketShare = ((r.min - r.current) * r.count) / totalMarketGap;
          const extraAlloc = extra * marketShare;
          allocations[key] = (genderAllocation + extraAlloc) / r.count;
        }
        benefitedCount = 20;
        scoreGapClosed = 100;
      } else {
        const pct = totalBudget / totalGenderGap;
        for (const key in roles) {
          const r = roles[key];
          const genderAllocation = r.genderGap * r.genderFemaleCount;
          allocations[key] = (genderAllocation * pct) / r.count;
        }
        benefitedCount = Math.round(pct * 11);
        scoreGapClosed = Math.round(pct * 100);
      }
    } else {
      const weightMarket = 0.5;
      const weightGender = 0.5;
      const combinedCapSum = (totalMarketGap * weightMarket) + (totalGenderGap * weightGender);

      const pct = Math.min(1, totalBudget / combinedCapSum);

      for (const key in roles) {
        const r = roles[key];
        const roleMarketCap = (r.min - r.current) * r.count;
        const roleGenderCap = r.genderGap * r.genderFemaleCount;

        const combinedRoleGap = (roleMarketCap * weightMarket) + (roleGenderCap * weightGender);
        allocations[key] = (combinedRoleGap * pct) / r.count;
      }

      if (totalBudget > combinedCapSum) {
        const extra = totalBudget - combinedCapSum;
        for (const key in roles) {
          allocations[key] += (extra * (roles[key].count / 20)) / roles[key].count;
        }
        benefitedCount = 20;
        scoreGapClosed = 100;
      } else {
        benefitedCount = Math.min(20, Math.round(pct * 16));
        scoreGapClosed = Math.round(pct * 100);
      }
    }
    // Renderizar datos del simulador en la UI (en vivo, sin retardo de animación numérica para transiciones rápidas)
    for (const key in roles) {
      const item = document.querySelector(`.sim-role-item[data-role="${key}"]`);
      if (!item) continue;

      const optValEl = item.querySelector(".opt-val");
      const barOptimizedEl = item.querySelector(".bar-optimized");

      const r = roles[key];
      const inc = Math.round(allocations[key]);
      const finalSalary = r.current + inc;


      optValEl.textContent = `S/. ${finalSalary.toLocaleString("es-PE")}`;

      const maxSalaryValue = 20500;
      const newPctWidth = Math.min(100, (finalSalary / maxSalaryValue) * 100);
      barOptimizedEl.style.width = `${newPctWidth}%`;
      barOptimizedEl.style.background = inc > 0 ? "linear-gradient(90deg, #005A9C, #008766)" : "transparent";
    }

    // Mostrar y actualizar panel de las métricas de resultado final
    const simResults = document.getElementById("simResults");
    if (simResults) {
      simResults.style.display = "flex";
    }

    const resBenefited = document.getElementById("resBenefited");
    const resGapClosed = document.getElementById("resGapClosed");

    if (resBenefited) resBenefited.textContent = benefitedCount;
    if (resGapClosed) resGapClosed.textContent = `${scoreGapClosed}%`;
  }

  // Escuchadores de eventos para recálculo interactivo en tiempo real al arrastrar o cambiar opciones
  budgetInput.addEventListener("input", updateSimulation);
  if (strategySelect) {
    strategySelect.addEventListener("change", updateSimulation);
  }

  // Lógica para botones de estrategia segmentados dinámica
  const strategyBtns = document.querySelectorAll(".strategy-btn");
  strategyBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      strategyBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      if (strategySelect) {
        strategySelect.value = btn.getAttribute("data-value");
        updateSimulation();
      }
    });
  });

  // Ejecutar inicialmente para poblar los números y barras al cargar el sitio
  updateSimulation();
}

function setupProfileInteractiveCanvas() {
  const canvas = document.getElementById("profileCanvas");
  const shell = document.querySelector(".profile-shell");
  if (!canvas || !shell) return;

  const ctx = canvas.getContext("2d");
  let w = 0;
  let h = 0;

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = rect.width;
    h = rect.height;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  if (window.ResizeObserver) {
    const ro = new ResizeObserver(() => resize());
    ro.observe(shell);
  } else {
    window.addEventListener("resize", resize, { passive: true });
  }
  resize();

  let isProfileVisible = false;
  if (window.IntersectionObserver) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        isProfileVisible = entry.isIntersecting;
        if (isProfileVisible && !prefersReduced) {
          requestAnimationFrame(draw);
        }
      });
    }, { threshold: 0.05 });
    io.observe(shell);
  } else {
    isProfileVisible = true;
  }

  let mouse = { x: null, y: null };
  shell.addEventListener("mousemove", (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = Math.max(0, e.clientX - r.left);
    mouse.y = Math.max(0, e.clientY - r.top);
  }, { passive: true });

  shell.addEventListener("mouseleave", () => {
    mouse.x = null;
    mouse.y = null;
  }, { passive: true });

  // Generar 46 puntos de dispersión salarial (Scatter Plot de Planilla & Benchmark)
  const dots = [];
  const dotColors = ["#00E5FF", "#38BDF8", "#34D399", "#818CF8", "#FBBF24", "#60A5FA"];
  for (let i = 0; i < 46; i++) {
    const xPct = 0.06 + (i / 46) * 0.88;
    // Dispersión gaussiana sobre la curva salarial
    const normalOffset = (Math.sin(i * 3.7) + Math.cos(i * 2.1)) * 0.08;
    const yPct = 0.68 - (xPct * 0.35) + normalOffset;
    dots.push({
      xPct: Math.max(0.05, Math.min(0.95, xPct)),
      yPct: Math.max(0.16, Math.min(0.84, yPct)),
      r: 3.8 + (i % 3) * 1.0,
      color: dotColors[i % dotColors.length],
      speed: 0.4 + (i % 4) * 0.2,
      phase: i * 0.45
    });
  }

  function draw(time) {
    if (!isProfileVisible || !canvas.offsetParent || w === 0 || h === 0) return;

    ctx.clearRect(0, 0, w, h);

    // Eje y márgenes cartesianos
    const marginL = 50;
    const marginB = 32;
    const marginT = 28;
    const marginR = 64;
    const plotW = Math.max(10, w - marginL - marginR);
    const plotH = Math.max(10, h - marginB - marginT);

    // Cuadriculado cartesiano visible y estilizado (Estilo terminal financiero)
    ctx.strokeStyle = "rgba(56, 189, 248, 0.14)";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 6]);

    // Líneas horizontales de percentiles
    const yRatios = [0.15, 0.35, 0.55, 0.75, 0.90];
    yRatios.forEach(r => {
      const y = marginT + plotH * r;
      ctx.beginPath();
      ctx.moveTo(marginL, y);
      ctx.lineTo(w - marginR, y);
      ctx.stroke();
    });

    // Líneas verticales de grados / factores
    const xRatios = [0.20, 0.40, 0.60, 0.80, 0.95];
    xRatios.forEach(r => {
      const x = marginL + plotW * r;
      ctx.beginPath();
      ctx.moveTo(x, marginT);
      ctx.lineTo(x, marginT + plotH);
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // Cálculo dinámico de las curvas salariales (P25, P50 Mediana, P90)
    const getCurveY = (x, yRatio, waveAmp, timeOffset) => {
      const normX = Math.max(0, (x - marginL) / plotW);
      const logGrowth = Math.log1p(normX * 2.4) * 0.32;
      const base = marginT + plotH * yRatio - (logGrowth * plotH * 0.78);
      const wave = Math.sin(normX * 8 + time * 0.0006 + timeOffset) * waveAmp;
      let y = base + wave;

      if (mouse.x !== null && mouse.x >= marginL && mouse.x <= w - marginR) {
        const dist = Math.abs(x - mouse.x);
        if (dist < 130) {
          const influence = (1 - dist / 130) * 0.22;
          y += (mouse.y - y) * influence;
        }
      }
      return y;
    };

    // Sombreado luminoso de la Banda de Equidad Salarial Intercuartil (P25 a P75)
    ctx.beginPath();
    for (let x = marginL; x <= w - marginR; x += 10) {
      const yP25 = getCurveY(x, 0.74, 8, 0);
      if (x === marginL) ctx.moveTo(x, yP25);
      else ctx.lineTo(x, yP25);
    }
    for (let x = w - marginR; x >= marginL; x -= 10) {
      const yP75 = getCurveY(x, 0.46, 10, 1.2);
      ctx.lineTo(x, yP75);
    }
    ctx.closePath();

    const bandGrad = ctx.createLinearGradient(0, marginT, 0, marginT + plotH);
    bandGrad.addColorStop(0, "rgba(0, 229, 255, 0.16)");
    bandGrad.addColorStop(0.5, "rgba(56, 189, 248, 0.11)");
    bandGrad.addColorStop(1, "rgba(52, 211, 153, 0.07)");
    ctx.fillStyle = bandGrad;
    ctx.fill();

    // Dibujar curvas percentilares con resplandor neón (P90, P50 Mediana, P25)
    const curves = [
      { yRatio: 0.36, color: "#38BDF8", glow: "rgba(56, 189, 248, 0.8)", width: 2.4, amp: 8, off: 2.1, label: "P90" },
      { yRatio: 0.54, color: "#00E5FF", glow: "rgba(0, 229, 255, 0.95)", width: 3.5, amp: 10, off: 0.8, label: "P50 Mediana" },
      { yRatio: 0.74, color: "#34D399", glow: "rgba(52, 211, 153, 0.8)", width: 2.4, amp: 8, off: 0, label: "P25" }
    ];

    curves.forEach((c) => {
      ctx.shadowBlur = 16;
      ctx.shadowColor = c.glow;
      ctx.strokeStyle = c.color;
      ctx.lineWidth = c.width;
      ctx.beginPath();

      let lastY = 0;
      for (let x = marginL; x <= w - marginR; x += 8) {
        const y = getCurveY(x, c.yRatio, c.amp, c.off);
        if (x === marginL) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        lastY = y;
      }
      ctx.stroke();

      // Etiqueta del percentil al extremo derecho (espacio despejado)
      ctx.shadowBlur = 0;
      ctx.font = "bold 11px 'Plus Jakarta Sans', sans-serif";
      ctx.fillStyle = c.color;
      ctx.textAlign = "left";
      ctx.fillText(c.label, w - marginR + 8, lastY + 4);
    });

    // Puntos de dispersión salarial (Colaboradores / Puestos Reales)
    dots.forEach((dot) => {
      const cx = marginL + plotW * dot.xPct + Math.sin(time * 0.0003 * dot.speed + dot.phase) * 6;
      const cy = marginT + plotH * dot.yPct + Math.cos(time * 0.0003 * dot.speed + dot.phase) * 6;

      let sizeMultiplier = 1;
      let isNearMouse = false;

      if (mouse.x !== null) {
        const dx = cx - mouse.x;
        const dy = cy - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 95) {
          isNearMouse = true;
          const proximity = (1 - dist / 95);
          sizeMultiplier = 1 + proximity * 0.6;

          // Rayos láser de interacción hacia el cursor
          ctx.strokeStyle = `rgba(0, 229, 255, ${proximity * 0.45})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }

      const pulse = Math.sin(time * 0.0025 + dot.phase) * 0.8;
      const r = (dot.r + pulse) * sizeMultiplier;

      // Halo difuso exterior
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 2.2, 0, Math.PI * 2);
      ctx.fillStyle = dot.color;
      ctx.globalAlpha = 0.20;
      ctx.fill();

      // Núcleo luminoso brillante
      ctx.shadowBlur = 12;
      ctx.shadowColor = dot.color;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = dot.color;
      ctx.globalAlpha = isNearMouse ? 1.0 : 0.90;
      ctx.fill();

      ctx.globalAlpha = 1.0;
      ctx.shadowBlur = 0;
    });

    // Marca de agua técnica sutil en el pie del gráfico
    ctx.shadowBlur = 0;
    ctx.textAlign = "left";
    ctx.font = "10px 'Plus Jakarta Sans', monospace";
    ctx.fillStyle = "rgba(56, 189, 248, 0.35)";
    ctx.fillText("▲ Curvas de Equidad & Regresión Salarial • SciPy / Statsmodels OLS", marginL, h - 10);

    if (isProfileVisible && !prefersReduced) {
      requestAnimationFrame(draw);
    }
  }

  if (!prefersReduced) {
    requestAnimationFrame(draw);
  }
}

function animateValue(obj, start, end, duration, suffix = "") {
  if (!obj) return;
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const currentVal = Math.floor(progress * (end - start) + start);

    if (suffix === "") {
      // Si no tiene sufijo ni es la sección resumen, es el sueldo del rol
      if (obj.classList.contains("opt-val")) {
        obj.textContent = `S/. ${currentVal.toLocaleString("es-PE")}`;
      } else {
        obj.textContent = currentVal;
      }
    } else {
      obj.textContent = `${currentVal}${suffix}`;
    }

    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      if (suffix === "") {
        if (obj.classList.contains("opt-val")) {
          obj.textContent = `S/. ${end.toLocaleString("es-PE")}`;
        } else {
          obj.textContent = end;
        }
      } else {
        obj.textContent = `${end}${suffix}`;
      }
    }
  };
  window.requestAnimationFrame(step);
}

// FORMULARIO DE CAPTACIÓN DE LEADS CON CONEXIÓN NETLIFY + TARJETA DE ÉXITO CRO
function setupLeadForm() {
  const form = document.getElementById("leadForm");
  const successCard = document.getElementById("formSuccessCard");
  const successWaBtn = document.getElementById("successWaBtn");
  const btnReset = document.getElementById("btnResetForm");
  const submitBtn = document.getElementById("btnSubmitLead");
  const status = document.getElementById("formStatus");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (form.elements.website && form.elements.website.value) {
      // Filtro anti-spam simple (honeypot)
      return;
    }

    if (!form.reportValidity()) {
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Enviando solicitud...";
    }
    if (status) {
      status.textContent = "Procesando...";
      status.className = "form-status";
    }

    const data = new FormData(form);
    const empresa = (data.get("empresa") || "mi empresa").toString().trim();
    const servicio = (data.get("servicio") || "consultoría").toString().trim();
    const formData = new URLSearchParams(data).toString();

    const showSuccess = () => {
      form.hidden = true;
      if (successCard) {
        successCard.hidden = false;
      }
      if (successWaBtn) {
        const textMsg = encodeURIComponent(
          `Hola Percy, acabo de enviar el formulario para ${empresa} solicitando información sobre ${servicio}.`
        );
        successWaBtn.href = `https://wa.me/${CONTACT_WHATSAPP}?text=${textMsg}`;
      }
      successCard.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    // Enviar datos por fetch a Netlify Forms
    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData
    })
      .then(() => {
        showSuccess();
      })
      .catch((error) => {
        console.warn("Netlify Forms endpoint no disponible o testing local:", error);
        // Mostrar confirmación y WhatsApp de respaldo inmediato para no perder el lead
        showSuccess();
      });
  });

  if (btnReset) {
    btnReset.addEventListener("click", () => {
      form.reset();
      form.hidden = false;
      if (successCard) {
        successCard.hidden = true;
      }
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Solicitar diagnóstico confidencial";
      }
      if (status) {
        status.textContent = "";
      }
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
}

// SINCRONIZACIÓN DE ENLACES DE CONTACTO A LO LARGO DE LA PÁGINA
function syncContactLinks() {
  const links = document.querySelectorAll('a[href^="mailto:"]');
  links.forEach((link) => {
    // Si contiene el email viejo o el genérico de la plantilla, reemplazarlo
    if (link.href.includes("tu-correo@empresa.com")) {
      const query = link.href.includes("?") ? link.href.slice(link.href.indexOf("?")) : "";
      link.href = `mailto:${CONTACT_EMAIL}${query}`;
    }
  });

  // Reemplazar textos de correo genéricos en el sidebar
  document.querySelectorAll(".contact-item a").forEach((link) => {
    if (link.textContent.trim() === "tu-correo@empresa.com") {
      link.textContent = CONTACT_EMAIL;
      link.href = `mailto:${CONTACT_EMAIL}`;
    }
    if (link.textContent.trim() === "linkedin.com/in/tu-perfil") {
      link.textContent = "LinkedIn de Percy";
      link.href = CONTACT_LINKEDIN;
    }
  });

  // Reemplazar enlaces a linkedin en el perfil del carrusel y barra de redes
  const linkedinLinks = document.querySelectorAll('a[href*="linkedin.com/in/percy-saul-muñoz-sierra-a1363a302"]');
  linkedinLinks.forEach(link => {
    link.href = CONTACT_LINKEDIN;
  });

  const whatsappLinks = document.querySelectorAll('a[href*="wa.me/"]');
  whatsappLinks.forEach(link => {
    // Si el link ya tiene un mensaje específico en su query param, no lo sobreescribimos
    if (!link.href.includes("text=")) {
      const textMsg = encodeURIComponent("Hola Percy, me contacto desde tu landing page para solicitar un diagnóstico para mi empresa.");
      link.href = `https://wa.me/${CONTACT_WHATSAPP}?text=${textMsg}`;
    } else {
      // Asegurar que el número apunte al configurado en CONTACT_WHATSAPP
      link.href = link.href.replace(/wa\.me\/\d+/, `wa.me/${CONTACT_WHATSAPP}`);
    }
  });
}

// ==========================================================================
// ANIMACIONES CINEMATOGRÁFICAS CON GSAP 3 & SCROLLTRIGGER
// ==========================================================================
function setupGsapAnimations() {
  if (prefersReduced) return;

  if (window.gsap) {
    if (window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
    }

    // 1. Hero Staggered Entrance Reveal
    const heroTl = gsap.timeline({ defaults: { ease: "power3.out", duration: 0.9 } });
    heroTl
      .from(".hero-practice-tag", { y: -16, opacity: 0, delay: 0.15 })
      .from(".hero-main-content h1", { y: 26, opacity: 0 }, "-=0.6")
      .from(".hero-copy", { y: 22, opacity: 0 }, "-=0.65")
      .from(".hero-actions .button", { y: 18, opacity: 0, stagger: 0.12 }, "-=0.6")
      .from(".hero-proof .metric", { y: 20, opacity: 0, stagger: 0.12 }, "-=0.5");

    // 2. Parallax cinematográfico en video de fondo
    const video = document.getElementById("heroBgVideo");
    if (video && window.ScrollTrigger) {
      gsap.to(video, {
        yPercent: 16,
        scale: 1.1,
        ease: "none",
        scrollTrigger: {
          trigger: "#inicio",
          start: "top top",
          end: "bottom top",
          scrub: 0.8
        }
      });
    }

    // 3. Reveal de Tarjetas de Prácticas
    if (window.ScrollTrigger) {
      gsap.from(".service-card", {
        scrollTrigger: {
          trigger: "#servicios",
          start: "top 80%",
          toggleActions: "play none none none"
        },
        y: 32,
        opacity: 0,
        duration: 0.75,
        stagger: 0.1,
        ease: "power2.out"
      });

      // 4. Reveal del Dashboard de KPIs
      gsap.from(".dash-kpi-card", {
        scrollTrigger: {
          trigger: "#metodo",
          start: "top 78%",
          toggleActions: "play none none none"
        },
        y: 26,
        opacity: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: "power2.out"
      });

      // 5. Reveal de Pasos metodológicos
      gsap.from(".step", {
        scrollTrigger: {
          trigger: ".steps",
          start: "top 82%",
          toggleActions: "play none none none"
        },
        x: -20,
        opacity: 0,
        duration: 0.65,
        stagger: 0.1,
        ease: "power2.out"
      });
    }
  } else {
    setupScrollAnimationsFallback();
  }
}

function setupScrollAnimationsFallback() {
  if (prefersReduced) return;
  const cards = document.querySelectorAll(
    ".service-card, .case-card, .step, .contact-item, .accordion-item, .sector-card, .testimonial-card, .nda-guarantee-card, .corp-badge, .dash-kpi-card"
  );

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  });

  cards.forEach(card => {
    card.style.opacity = "0";
    card.style.transform = "translateY(24px)";
    card.style.transition = "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s ease";
    observer.observe(card);
  });
}

// RED CUÁNTICA DE PARTÍCULAS HERO (PEOPLE ANALYTICS DATA-MESH)
function setupHeroParticlesCanvas() {
  const canvas = document.getElementById("heroParticlesCanvas");
  const hero = document.getElementById("inicio");
  if (!canvas || !hero) return;

  const ctx = canvas.getContext("2d");
  let w = 0;
  let h = 0;

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = rect.width;
    h = rect.height;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  resize();
  window.addEventListener("resize", resize, { passive: true });

  let isHeroVisible = true;
  if (window.IntersectionObserver) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        isHeroVisible = entry.isIntersecting;
        if (isHeroVisible && !prefersReduced) {
          requestAnimationFrame(draw);
        }
      });
    }, { threshold: 0.05 });
    io.observe(hero);
  }

  let mouse = { x: null, y: null };
  hero.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  }, { passive: true });

  hero.addEventListener("mouseleave", () => {
    mouse.x = null;
    mouse.y = null;
  }, { passive: true });

  const particleCount = 52;
  const particles = [];
  const palette = [
    "rgba(0, 90, 156, 0.8)",
    "rgba(0, 135, 102, 0.8)",
    "rgba(255, 255, 255, 0.7)",
    "rgba(96, 165, 250, 0.8)"
  ];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * (w || 1200),
      y: Math.random() * (h || 700),
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: 1.4 + Math.random() * 2.0,
      color: palette[i % palette.length]
    });
  }

  function draw() {
    if (!isHeroVisible || w === 0 || h === 0) return;

    ctx.clearRect(0, 0, w, h);

    const maxDist = 115;
    const maxDistSq = maxDist * maxDist;

    // Conexiones de red tipo data-mesh
    for (let i = 0; i < particles.length; i++) {
      const p1 = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dSq = dx * dx + dy * dy;

        if (dSq < maxDistSq) {
          const alpha = (1 - Math.sqrt(dSq) / maxDist) * 0.22;
          ctx.strokeStyle = `rgba(147, 197, 253, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }

    // Dibujar nodos
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      if (mouse.x !== null && mouse.y !== null) {
        const mdx = p.x - mouse.x;
        const mdy = p.y - mouse.y;
        const mDistSq = mdx * mdx + mdy * mdy;
        if (mDistSq < 14400 && mDistSq > 10) {
          const mDist = Math.sqrt(mDistSq);
          const force = (1 - mDist / 120) * 1.2;
          p.x += (mdx / mDist) * force;
          p.y += (mdy / mDist) * force;
        }
      }

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;

      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    if (!prefersReduced && isHeroVisible) {
      requestAnimationFrame(draw);
    }
  }

  requestAnimationFrame(draw);
}

// ACORDEÓN DE CAPACITACIONES INTERACTIVAS
function setupAccordion() {
  const headers = document.querySelectorAll(".accordion-header");
  headers.forEach((header) => {
    header.addEventListener("click", () => {
      const item = header.parentElement;
      const content = item.querySelector(".accordion-content");
      const active = item.classList.contains("active");

      // Cerrar otros acordeones (comportamiento clásico)
      document.querySelectorAll(".accordion-item").forEach((otherItem) => {
        if (otherItem !== item) {
          otherItem.classList.remove("active");
          const otherContent = otherItem.querySelector(".accordion-content");
          if (otherContent) otherContent.style.maxHeight = null;
        }
      });

      item.classList.toggle("active");

      if (item.classList.contains("active")) {
        header.setAttribute("aria-expanded", "true");
        content.style.maxHeight = `${content.scrollHeight}px`;
      } else {
        header.setAttribute("aria-expanded", "false");
        content.style.maxHeight = null;
      }
    });
  });
}

// Event Listeners y Carga de Módulos
window.addEventListener("resize", () => {
  if (modelCanvasState) {
    modelCanvasState.resize();
  }
}, { passive: true });

// EVALUADOR DE RIESGO DE CUMPLIMIENTO LEY 30709 (QUIZ FUNNEL CRO)
function setupRiskEvaluator() {
  const btn = document.getElementById("btnCheckRisk");
  const resultDiv = document.getElementById("riskResult");
  const badge = document.getElementById("riskBadge");
  const scorePill = document.getElementById("riskScorePill");
  const textField = document.getElementById("riskText");
  const fineBox = document.getElementById("riskFineBox");
  const waBtn = document.getElementById("riskWaBtn");
  const formBtn = document.getElementById("riskFormBtn");

  if (!btn || !resultDiv) return;

  btn.addEventListener("click", () => {
    const q1 = document.querySelector('input[name="q1"]:checked');
    const q2 = document.querySelector('input[name="q2"]:checked');
    const q3 = document.querySelector('input[name="q3"]:checked');

    if (!q1 || !q2 || !q3) {
      alert("Por favor, responde las 3 preguntas clave para emitir tu diagnóstico.");
      return;
    }

    // Feedback dinámico de procesamiento para generar autoridad diagnóstica
    btn.disabled = true;
    const originalText = btn.textContent;
    btn.textContent = "Analizando respuestas según escala SUNAFIL...";

    setTimeout(() => {
      btn.disabled = false;
      btn.textContent = originalText;
      resultDiv.hidden = false;

      let failures = 0;
      if (q1.value === "no") failures++;
      if (q2.value === "no") failures++;
      if (q3.value === "no") failures++;

      if (failures > 0) {
        resultDiv.className = "risk-result high";
        badge.textContent = "ALTO RIESGO / CONTINGENCIA SUNAFIL DETECTADA";
        if (scorePill) {
          scorePill.textContent = `${failures} de 3 requisitos obligatorios incumplidos`;
          scorePill.className = "risk-score-pill danger";
        }
        textField.innerHTML =
          "Tu organización presenta <strong>omisiones estructurales graves frente a la Ley 30709</strong>. La ausencia de un Cuadro de Categorías valorado (CCF), de una política salarial comunicada con constancia de entrega o de justificaciones estadísticas para brechas de remuneración no admite subsanación posterior una vez notificada la fiscalización.";
        
        if (fineBox) fineBox.style.display = "flex";

        if (waBtn) {
          const waMsg = encodeURIComponent(
            `Hola Percy, completé el evaluador de la Ley 30709 en tu web y mi empresa obtuvo ALTO RIESGO (${failures}/3 requisitos). Quisiera agendar una sesión preventiva urgente.`
          );
          waBtn.href = `https://wa.me/${CONTACT_WHATSAPP}?text=${waMsg}`;
          waBtn.innerHTML = `
            <span style="display:inline-flex; align-items:center; gap:8px;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff" aria-hidden="true"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.42 0-2.82-.37-4.06-1.08l-.29-.17-3.02.79.81-2.94-.19-.3a8.21 8.21 0 0 1-1.26-4.37c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.59c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.49-1.41-1.74-.14-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.13-.15.17-.25.25-.42.08-.17.04-.32-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.32-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.78 2.72 4.31 3.81.6.26 1.07.41 1.44.53.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.17-.48-.29z"/></svg>
              Agendar Sesión de Rescate Preventivo (15 min)
            </span>`;
        }
      } else {
        resultDiv.className = "risk-result low";
        badge.textContent = "RIESGO BAJO / CUMPLIMIENTO BASE ACREDITADO";
        if (scorePill) {
          scorePill.textContent = "3 de 3 requisitos clave cumplidos";
          scorePill.className = "risk-score-pill success";
        }
        textField.innerHTML =
          "¡Felicitaciones! Tu estructura salarial cuenta con los pilares base exigidos por ley. Recuerda que la principal fuente de multas en empresas conformes ocurre con el ingreso de <strong>nuevas contrataciones o incrementos no homologados</strong> que distorsionan las bandas. Recomendamos una auditoría anual de mantenimiento.";
        
        if (fineBox) fineBox.style.display = "none";

        if (waBtn) {
          const waMsg = encodeURIComponent(
            "Hola Percy, obtuve RIESGO BAJO en el evaluador de la Ley 30709. Quisiera consultar sobre auditorías anuales de mantenimiento salarial."
          );
          waBtn.href = `https://wa.me/${CONTACT_WHATSAPP}?text=${waMsg}`;
          waBtn.innerHTML = `
            <span style="display:inline-flex; align-items:center; gap:8px;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff" aria-hidden="true"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.42 0-2.82-.37-4.06-1.08l-.29-.17-3.02.79.81-2.94-.19-.3a8.21 8.21 0 0 1-1.26-4.37c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.59c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.49-1.41-1.74-.14-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.13-.15.17-.25.25-.42.08-.17.04-.32-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.32-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.78 2.72 4.31 3.81.6.26 1.07.41 1.44.53.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.17-.48-.29z"/></svg>
              Solicitar Auditoría de Mantenimiento
            </span>`;
        }
      }

      // Preseleccionar servicio en el formulario de contacto si hace scroll
      if (formBtn) {
        formBtn.onclick = () => {
          const selectServicio = document.querySelector('select[name="servicio"]');
          if (selectServicio) {
            selectServicio.value = "Auditoría Ley 30709 (SUNAFIL)";
          }
        };
      }

      resultDiv.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 450);
  });
}

// CONTROLADOR DE VIDEO DE FONDO CON EFECTO ZOOM Y REPRODUCCIÓN EN SCROLL
function setupHeroBackgroundVideo() {
  const video = document.getElementById("heroBgVideo");
  const hero = document.getElementById("inicio");
  const soundBtn = document.getElementById("heroVideoSoundBtn");
  if (!video || !hero) return;

  // Autoplay silenciado garantizado por defecto
  video.muted = true;
  const playPromise = video.play();
  if (playPromise !== undefined) {
    playPromise.catch(() => {
      // Si el navegador bloquea autoplay hasta interacción, reintentar al primer scroll o toque
      const startOnInteraction = () => {
        video.play().catch(() => {});
        window.removeEventListener("scroll", startOnInteraction);
        window.removeEventListener("touchstart", startOnInteraction);
        window.removeEventListener("click", startOnInteraction);
      };
      window.addEventListener("scroll", startOnInteraction, { passive: true, once: true });
      window.addEventListener("touchstart", startOnInteraction, { passive: true, once: true });
      window.addEventListener("click", startOnInteraction, { once: true });
    });
  }

  // Pausar reproducción cuando el usuario se desplaza más abajo para optimizar rendimiento
  const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, {
    threshold: 0.05
  });
  heroObserver.observe(hero);

  // EFECTO DINÁMICO DE ZOOM Y REPRODUCCIÓN AL HACER SCROLL
  if (!prefersReduced) {
    let isTicking = false;
    let lastScrollY = window.scrollY;
    let rateTimeout = null;

    window.addEventListener("scroll", () => {
      if (!isTicking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const heroHeight = hero.offsetHeight || window.innerHeight;

          if (scrollY <= heroHeight * 1.5) {
            // Progreso relativo al scroll en la cabecera (0 a 1)
            const progress = Math.min(1.4, scrollY / heroHeight);

            // ZOOM CONTINUO: escala cinematográfica suave de 1.00 hasta 1.38x
            const scale = 1.0 + (progress * 0.38);

            // Parallax sutil hacia abajo que añade tridimensionalidad y profundidad
            const translateY = scrollY * 0.28;

            video.style.transform = `scale(${scale.toFixed(3)}) translateY(${translateY.toFixed(1)}px)`;

            // Asegurar reproducción activa mientras se navega
            if (video.paused) {
              video.play().catch(() => {});
            }

            // Aceleración de velocidad según el impulso del scroll
            const delta = Math.abs(scrollY - lastScrollY);
            if (delta > 3) {
              video.playbackRate = Math.min(1.8, 1.0 + (delta * 0.015));
              clearTimeout(rateTimeout);
              rateTimeout = setTimeout(() => {
                video.playbackRate = 1.0;
              }, 120);
            }
            lastScrollY = scrollY;
          }
          isTicking = false;
        });
        isTicking = true;
      }
    }, { passive: true });
  }

  // Toggle de Sonido (1 clic para activar o silenciar audio con feedback visual)
  if (soundBtn) {
    const iconMuted = soundBtn.querySelector(".icon-muted");
    const iconUnmuted = soundBtn.querySelector(".icon-unmuted");
    const soundLabel = document.getElementById("heroSoundLabel");

    soundBtn.addEventListener("click", () => {
      video.muted = !video.muted;
      if (video.muted) {
        if (iconMuted) iconMuted.style.display = "block";
        if (iconUnmuted) iconUnmuted.style.display = "none";
        if (soundLabel) soundLabel.textContent = "Activar sonido";
        soundBtn.style.background = "rgba(8, 15, 24, 0.78)";
      } else {
        if (iconMuted) iconMuted.style.display = "none";
        if (iconUnmuted) iconUnmuted.style.display = "block";
        if (soundLabel) soundLabel.textContent = "Silenciar";
        soundBtn.style.background = "rgba(0, 127, 122, 0.95)";
        if (video.paused) {
          video.play().catch(() => {});
        }
      }
    });
  }

  // Al finalizar video, reiniciar en bucle perfecto
  video.addEventListener("ended", () => {
    video.currentTime = 0;
    video.play().catch(() => {});
  });
}

// ==========================================================================
// ESTADÍSTICAS ANIMADAS (APPLE STYLE SMOOTH COUNT-UP INTERACTION)
// ==========================================================================
function setupStatCounters() {
  const counterEls = document.querySelectorAll(".counter-val");
  if (!counterEls.length) return;

  const animateCount = (el) => {
    if (el.dataset.animated === "true") return;
    el.dataset.animated = "true";

    const target = parseFloat(el.getAttribute("data-target")) || 0;
    const prefix = el.getAttribute("data-prefix") || "";
    const suffix = el.getAttribute("data-suffix") || "";
    const decimals = parseInt(el.getAttribute("data-decimals"), 10) || 0;
    const isCurrency = el.getAttribute("data-format") === "currency";
    const duration = 1600;
    const startTime = performance.now();

    const formatVal = (val) => {
      let str = decimals > 0 ? val.toFixed(decimals) : Math.round(val).toString();
      if (isCurrency || val >= 1000) {
        const parts = str.split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        str = parts.join(".");
      }
      return `${prefix}${str}${suffix}`;
    };

    const update = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Curva easeOutExpo para frenado ultra elegante y profesional
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = target * ease;

      el.textContent = formatVal(current);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = formatVal(target);
      }
    };
    requestAnimationFrame(update);
  };

  if (window.IntersectionObserver) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    counterEls.forEach((el) => observer.observe(el));
  } else {
    counterEls.forEach((el) => animateCount(el));
  }
}

// ==========================================================================
// MODO OSCURO / CLARO (DARK MODE TOGGLE CON LOCALSTORAGE Y PREFERENCIA SO)
// ==========================================================================
function setupThemeToggle() {
  const toggleBtn = document.getElementById("themeToggleBtn");
  if (!toggleBtn) return;

  const sunIcon = toggleBtn.querySelector(".theme-icon-sun");
  const moonIcon = toggleBtn.querySelector(".theme-icon-moon");

  const savedTheme = localStorage.getItem("theme");
  const systemPrefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");

  const applyTheme = (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);

    if (theme === "dark") {
      if (sunIcon) sunIcon.style.display = "block";
      if (moonIcon) moonIcon.style.display = "none";
      toggleBtn.setAttribute("aria-label", "Cambiar a modo claro");
      toggleBtn.title = "Cambiar a modo claro";
    } else {
      if (sunIcon) sunIcon.style.display = "none";
      if (moonIcon) moonIcon.style.display = "block";
      toggleBtn.setAttribute("aria-label", "Cambiar a modo oscuro");
      toggleBtn.title = "Cambiar a modo oscuro";
    }
  };

  applyTheme(initialTheme);

  toggleBtn.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    applyTheme(newTheme);
  });
}

// ==========================================================================
// MENÚ MÓVIL DOCK FLOTANTE (HAMBURGUESA & CAJÓN MODERNO)
// ==========================================================================
function setupMobileMenu() {
  const menuBtn = document.getElementById("mobileMenuBtn");
  const drawer = document.getElementById("mobileNavDrawer");
  if (!menuBtn || !drawer) return;

  const toggleMenu = () => {
    const isOpen = drawer.classList.contains("is-open");
    if (isOpen) {
      drawer.classList.remove("is-open");
      menuBtn.classList.remove("is-active");
      menuBtn.setAttribute("aria-expanded", "false");
      drawer.setAttribute("aria-hidden", "true");
    } else {
      drawer.classList.add("is-open");
      menuBtn.classList.add("is-active");
      menuBtn.setAttribute("aria-expanded", "true");
      drawer.setAttribute("aria-hidden", "false");
    }
  };

  menuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  drawer.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      drawer.classList.remove("is-open");
      menuBtn.classList.remove("is-active");
      menuBtn.setAttribute("aria-expanded", "false");
      drawer.setAttribute("aria-hidden", "true");
    });
  });

  document.addEventListener("click", (e) => {
    if (drawer.classList.contains("is-open") && !drawer.contains(e.target) && !menuBtn.contains(e.target)) {
      drawer.classList.remove("is-open");
      menuBtn.classList.remove("is-active");
      menuBtn.setAttribute("aria-expanded", "false");
      drawer.setAttribute("aria-hidden", "true");
    }
  });
}

// ==========================================================================
// BOTÓN VOLVER ARRIBA (BACK TO TOP)
// ==========================================================================
function setupBackToTop() {
  const btn = document.getElementById("backToTopBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function initializeApp() {
  syncContactLinks();
  setupCarousel();
  setupTabs();
  setupSimulator();
  setupLeadForm();
  setupGsapAnimations();
  setupHeroParticlesCanvas();
  setupProfileInteractiveCanvas();
  setupModelCanvas();
  setupAccordion();
  setupRiskEvaluator();
  setupHeroBackgroundVideo();
  setupStatCounters();
  setupThemeToggle();
  setupMobileMenu();
  setupBackToTop();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp);
} else {
  initializeApp();
}
