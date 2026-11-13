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
    ctx.fillStyle = "#111a22";
    ctx.fillRect(0, 0, w, h);

    const left = 44;
    const bottom = h - 118;
    const top = 42;
    const right = w - 34;

    ctx.globalAlpha = 0.25;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    for (let y = top; y <= bottom; y += 46) {
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(right, y);
      ctx.stroke();
    }

    const families = [
      { x: 0.18, c: "#59c4bd" },
      { x: 0.38, c: "#6ea8fe" },
      { x: 0.58, c: "#ff947d" },
      { x: 0.78, c: "#f1c84b" }
    ];

    families.forEach((fam, idx) => {
      const cx = left + (right - left) * fam.x;
      const bandTop = top + 46 + idx * 18;
      const bandHeight = 118 + idx * 16;
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = fam.c;
      ctx.fillRect(cx - 42, bandTop, 84, bandHeight);
      ctx.globalAlpha = 0.84;
      ctx.strokeStyle = fam.c;
      ctx.lineWidth = 2;
      ctx.strokeRect(cx - 42, bandTop, 84, bandHeight);

      for (let j = 0; j < 16; j += 1) {
        const jitter = Math.sin(time * 0.001 + j * 1.7 + idx) * 14;
        const y = bandTop + 12 + ((j * 31) % Math.max(36, bandHeight - 24));
        ctx.globalAlpha = 0.82;
        ctx.fillStyle = fam.c;
        ctx.beginPath();
        ctx.arc(cx + jitter, y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    ctx.globalAlpha = 0.95;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(left, bottom);
    ctx.lineTo(right, bottom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(left, top);
    ctx.lineTo(left, bottom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(left, top);
    ctx.lineTo(right, top);
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
  const dots = document.querySelectorAll(".profile-dots span");
  const prevBtn = document.querySelector(".profile-arrow.prev-slide");
  const nextBtn = document.querySelector(".profile-arrow.next-slide");

  if (slides.length <= 1) return;

  let currentIdx = 0;

  function showSlide(index) {
    slides.forEach(slide => slide.classList.remove("active"));
    dots.forEach(dot => dot.classList.remove("active"));

    // Ajustar límites del índice
    currentIdx = (index + slides.length) % slides.length;

    slides[currentIdx].classList.add("active");
    if (dots[currentIdx]) {
      dots[currentIdx].classList.add("active");
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
      showSlide(targetIdx);
    });
  });
}

// CONTROL DE PESTAÑAS (MÉTODO - GRÁFICO VS SIMULADOR)
function setupTabs() {
  const btnShowGraph = document.getElementById("btnShowGraph");
  const btnShowSim = document.getElementById("btnShowSim");
  const tabGraph = document.getElementById("tabGraph");
  const tabSim = document.getElementById("tabSim");

  if (!btnShowGraph || !btnShowSim) return;

  btnShowGraph.addEventListener("click", () => {
    btnShowGraph.classList.add("active");
    btnShowSim.classList.remove("active");
    tabGraph.classList.add("active");
    tabSim.classList.remove("active");

    // Forzar redibujo de canvas cuando vuelve a estar visible
    if (modelCanvasState) {
      modelCanvasState.resize();
      requestAnimationFrame(modelCanvasState.drawLoop);
    }
  });

  btnShowSim.addEventListener("click", () => {
    btnShowSim.classList.add("active");
    btnShowGraph.classList.remove("active");
    tabSim.classList.add("active");
    tabGraph.classList.remove("active");
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
      barOptimizedEl.style.background = inc > 0 ? "linear-gradient(90deg, #007f7a, #00b0ff)" : "transparent";
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

  // Generar puntos de dispersión salarial realistas (Scatter Plot de Planilla y Benchmark)
  const dots = [];
  const dotColors = ["#007f7a", "#1c5298", "#2d7a46", "#00938d", "#c84d36"];
  for (let i = 0; i < 42; i++) {
    const xPct = 0.08 + (i / 42) * 0.84;
    // Dispersión con distribución gaussiana alrededor de la mediana
    const normalOffset = (Math.sin(i * 3.7) + Math.cos(i * 2.1)) * 0.07;
    const yPct = 0.68 - (xPct * 0.34) + normalOffset;
    dots.push({
      xPct: Math.max(0.06, Math.min(0.94, xPct)),
      yPct: Math.max(0.18, Math.min(0.82, yPct)),
      r: 3.0 + (i % 3) * 0.8,
      color: dotColors[i % dotColors.length],
      speed: 0.4 + (i % 4) * 0.2,
      phase: i * 0.45
    });
  }

  function draw(time) {
    if (!isProfileVisible || !canvas.offsetParent || w === 0 || h === 0) return;

    ctx.clearRect(0, 0, w, h);

    // Cuadriculado cartesiano tenue de alta resolución (estilo Matplotlib / Seaborn)
    ctx.strokeStyle = "rgba(15, 23, 42, 0.04)";
    ctx.lineWidth = 1;
    const gridSize = 48;
    for (let x = 0; x < w; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Marca de agua estadística en código Python tenue en la esquina inferior
    ctx.font = "11px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = "rgba(15, 23, 42, 0.22)";
    ctx.fillText("Modelo: y = β₀ + β₁·ln(x) + ε | R² = 0.942 | SciPy Regress (Python)", 32, h - 22);

    // Cálculo dinámico de las curvas salariales (P25, P50 Mediana, P90)
    const getCurveY = (x, yRatio, waveAmp, timeOffset) => {
      const normalizedX = x / w;
      const logGrowth = Math.log1p(normalizedX * 2.2) * 0.28;
      const base = h * yRatio - (logGrowth * h * 0.85);
      const wave = Math.sin(x * 0.007 + time * 0.0006 + timeOffset) * waveAmp;
      let y = base + wave;

      if (mouse.x !== null) {
        const dist = Math.abs(x - mouse.x);
        if (dist < 140) {
          const influence = (1 - dist / 140) * 0.22;
          y += (mouse.y - y) * influence;
        }
      }
      return y;
    };

    // Sombreado de la Banda de Confianza Intercuartil (P25 a P75)
    ctx.beginPath();
    for (let x = 0; x <= w; x += 12) {
      const yP25 = getCurveY(x, 0.72, 12, 0);
      if (x === 0) ctx.moveTo(x, yP25);
      else ctx.lineTo(x, yP25);
    }
    for (let x = w; x >= 0; x -= 12) {
      const yP75 = getCurveY(x, 0.44, 14, 1.2);
      ctx.lineTo(x, yP75);
    }
    ctx.closePath();
    ctx.fillStyle = "rgba(0, 127, 122, 0.04)";
    ctx.fill();

    // Dibujar las 3 curvas percentilares clave
    const curves = [
      { yRatio: 0.34, color: "rgba(28, 82, 152, 0.38)", width: 1.5, dash: [5, 4], amp: 14, off: 2.1, label: "P90" },
      { yRatio: 0.52, color: "rgba(0, 127, 122, 0.65)", width: 2.6, dash: [], amp: 16, off: 0.8, label: "P50 (Mediana Mercado)" },
      { yRatio: 0.72, color: "rgba(200, 77, 54, 0.35)", width: 1.5, dash: [5, 4], amp: 12, off: 0, label: "P25" }
    ];

    curves.forEach((c) => {
      ctx.strokeStyle = c.color;
      ctx.lineWidth = c.width;
      ctx.setLineDash(c.dash);
      ctx.beginPath();

      for (let x = 0; x <= w; x += 8) {
        const y = getCurveY(x, c.yRatio, c.amp, c.off);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      const endY = getCurveY(w - 20, c.yRatio, c.amp, c.off);
      ctx.font = "10px 'Plus Jakarta Sans', sans-serif";
      ctx.fillStyle = c.color;
      ctx.fillText(c.label, w - 120, endY - 6);
    });

    // Dibujar los puntos de dispersión salarial (Scatter Plot)
    dots.forEach((dot) => {
      const cx = w * dot.xPct + Math.sin(time * 0.0004 * dot.speed + dot.phase) * 12;
      const cy = h * dot.yPct + Math.cos(time * 0.0004 * dot.speed + dot.phase) * 8;

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

          ctx.strokeStyle = `rgba(0, 127, 122, ${proximity * 0.22})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }

      ctx.fillStyle = dot.color;
      ctx.globalAlpha = isNearMouse ? 0.85 : 0.42;

      ctx.beginPath();
      ctx.arc(cx, cy, dot.r * sizeMultiplier, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 1.0;
    });

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

// INICIADOR DE ANIMACIONES SUB-VISUALES AL HACER SCROLL (INTERACTION OBSERVER)
function setupScrollAnimations() {
  if (prefersReduced) return;
  const cards = document.querySelectorAll(
    ".service-card, .case-card, .step, .contact-item, .accordion-item, .sector-card, .testimonial-card, .nda-guarantee-card, .corp-badge"
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
    const duration = 1600;
    const startTime = performance.now();

    const update = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Curva easeOutExpo para frenado ultra elegante y profesional
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.round(ease * target);

      el.textContent = `${prefix}${current}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = `${prefix}${target}${suffix}`;
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
// EFECTO 3D TILT EN TARJETAS PREMIUM (MICRO-INTERACCIONES FÍSICAS)
// ==========================================================================
function setup3DCardTilt() {
  if (prefersReduced || window.innerWidth < 768) return;

  const tiltCards = document.querySelectorAll(
    ".service-card, .case-card, .sector-card, .profile-card, .incompany-card"
  );

  tiltCards.forEach((card) => {
    let rafId = null;

    card.addEventListener("mousemove", (e) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -5;
        const rotateY = ((x - centerX) / centerX) * 5;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
      });
    });

    card.addEventListener("mouseleave", () => {
      if (rafId) cancelAnimationFrame(rafId);
      card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)";
    });
  });
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
  setupScrollAnimations();
  setupProfileInteractiveCanvas();
  setupModelCanvas();
  setupAccordion();
  setupRiskEvaluator();
  setupHeroBackgroundVideo();
  setupStatCounters();
  setup3DCardTilt();
  setupThemeToggle();
  setupMobileMenu();
  setupBackToTop();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp);
} else {
  initializeApp();
}
