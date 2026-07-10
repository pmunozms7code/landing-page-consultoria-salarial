// Configuración de datos de contacto centralizada
const CONTACT_EMAIL = "pmunozms7@outlook.com"; // Cambiar por tu correo de contacto principal
const CONTACT_WHATSAPP = "51931697778";
const CONTACT_LINKEDIN = "https://www.linkedin.com/in/percy-saul-muñoz-sierra-a1363a302";

const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// CANVAS DE LA LANDING PAGE (HERO Y PANEL METODO)
function setupCanvas(canvas) {
  const ctx = canvas.getContext("2d");
  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return rect;
  };
  return { ctx, resize };
}

function drawSalaryHero(time) {
  const canvas = document.getElementById("salaryCanvas");
  if (!canvas) return;
  const { ctx, resize } = setupCanvas(canvas);
  const rect = resize();
  const w = rect.width;
  const h = rect.height;
  ctx.clearRect(0, 0, w, h);

  ctx.globalAlpha = 0.42;
  ctx.strokeStyle = "#c7d5dc";
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 54) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += 54) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  const bands = [
    { y: 0.34, color: "#225ea8", label: "P50" },
    { y: 0.48, color: "#007f7a", label: "P75" },
    { y: 0.62, color: "#d65f46", label: "P90" }
  ];

  bands.forEach((band, i) => {
    ctx.globalAlpha = 0.88;
    ctx.strokeStyle = band.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = w * 0.38; x < w + 20; x += 18) {
      const wave = Math.sin(x * 0.011 + time * 0.001 + i) * 12;
      const growth = (x - w * 0.38) * 0.105;
      const y = h * band.y - growth + wave;
      if (x === w * 0.38) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  });

  for (let i = 0; i < 92; i += 1) {
    const x = w * (0.42 + ((i * 37) % 58) / 100);
    const base = h * (0.64 - ((i * 17) % 40) / 100);
    const y = base + Math.sin(time * 0.0012 + i) * 11;
    const colors = ["#225ea8", "#007f7a", "#d65f46", "#33824b", "#b38b00"];
    ctx.globalAlpha = 0.62;
    ctx.fillStyle = colors[i % colors.length];
    ctx.beginPath();
    ctx.arc(x, y, 3.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawModelPanel(time) {
  const canvas = document.getElementById("modelCanvas");
  if (!canvas || !canvas.offsetParent) return; // No dibujar si está oculto (pestaña inactiva)
  const { ctx, resize } = setupCanvas(canvas);
  const rect = resize();
  const w = rect.width;
  const h = rect.height;
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

function animate(time) {
  drawSalaryHero(time);
  drawModelPanel(time);
  if (!prefersReduced) requestAnimationFrame(animate);
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
    animate(performance.now());
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

  const { ctx, resize } = setupCanvas(canvas);
  let rect = resize();

  let mouse = { x: null, y: null };
  shell.addEventListener("mousemove", (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = Math.max(0, e.clientX - r.left);
    mouse.y = Math.max(0, e.clientY - r.top);
  });

  shell.addEventListener("mouseleave", () => {
    mouse.x = null;
    mouse.y = null;
  });

  // Generar puntos salariales ficticios aleatorios que flotan de fondo
  const dots = [];
  const dotColors = ["#05c3df", "#007f7a", "#ff947d", "#f1c84b", "#6ea8fe"];
  for (let i = 0; i < 48; i++) {
    dots.push({
      xPct: 0.05 + Math.random() * 0.9,
      yPct: 0.15 + Math.random() * 0.7,
      r: 2.2 + Math.random() * 2.8,
      color: dotColors[i % dotColors.length],
      speed: 0.3 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2
    });
  }

  function draw(time) {
    if (!canvas.offsetParent) {
      requestAnimationFrame(draw);
      return;
    }

    rect = resize();
    const w = rect.width;
    const h = rect.height;
    ctx.clearRect(0, 0, w, h);

    // Color del fondo del canvas
    ctx.fillStyle = "#0c1524";
    ctx.fillRect(0, 0, w, h);

    // Dibujar cuadriculado tenue de fondo
    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    ctx.lineWidth = 1;
    const gridSize = 42;
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

    // Dibujar las tres bandas de percentil (Curvas de sueldo)
    const curves = [
      { yRatio: 0.32, color: "rgba(110, 168, 254, 0.38)", width: 1.5 },
      { yRatio: 0.50, color: "rgba(5, 195, 223, 0.58)", width: 2.5 },
      { yRatio: 0.68, color: "rgba(0, 127, 122, 0.38)", width: 1.5 }
    ];

    curves.forEach((c) => {
      ctx.strokeStyle = c.color;
      ctx.lineWidth = c.width;
      ctx.beginPath();

      for (let x = 0; x <= w; x += 10) {
        // Generar una curva descendente/ascendente realista propia del mercado
        const base = h * c.yRatio - (x - w * 0.38) * 0.075;
        const wave = Math.sin(x * 0.006 + time * 0.0006) * 16;
        let y = base + wave;

        // Efecto gravity pull cuando el mouse está cerca de la línea
        if (mouse.x !== null) {
          const dist = Math.abs(x - mouse.x);
          if (dist < 150) {
            const influence = (1 - dist / 150) * 0.25;
            y += (mouse.y - y) * influence;
          }
        }

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    });

    // Dibujar los puntos salariales que flotan y se conectan interactiva
    dots.forEach((dot) => {
      const cx = w * dot.xPct + Math.sin(time * 0.0003 * dot.speed + dot.phase) * 15;
      const cy = h * dot.yPct + Math.cos(time * 0.0003 * dot.speed + dot.phase) * 10;

      let glow = 0;
      let sizeMultiplier = 1;

      if (mouse.x !== null) {
        const dx = cx - mouse.x;
        const dy = cy - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 88) {
          glow = (1 - dist / 88);
          sizeMultiplier = 1 + glow * 0.8;

          // Rayo conector del cursor al punto
          ctx.strokeStyle = `rgba(5, 195, 223, ${glow * 0.16})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }

      ctx.fillStyle = dot.color;

      if (glow > 0) {
        ctx.shadowColor = dot.color;
        ctx.shadowBlur = glow * 10;
      }

      ctx.beginPath();
      ctx.arc(cx, cy, dot.r * sizeMultiplier, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;
    });

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
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

// FORMULARIO DE CAPTACIÓN DE LEADS CON CONEXIÓN NETLIFY + DESCARGA + EMAIL
function setupLeadForm() {
  const form = document.getElementById("leadForm");
  const status = document.getElementById("formStatus");
  const downloadLead = document.getElementById("downloadLead");
  if (!form || !status) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (form.elements.website && form.elements.website.value) {
      // Filtro anti-spam simple (honeypot)
      return;
    }

    if (!form.reportValidity()) {
      return;
    }

    const data = new FormData(form);
    const entries = [
      ["Nombre", data.get("nombre")],
      ["Correo", data.get("correo")],
      ["Telefono", data.get("telefono")],
      ["Cargo", data.get("cargo")],
      ["Empresa", data.get("empresa")],
      ["Pais", data.get("pais")],
      ["Sitio web", data.get("sitio_web")],
      ["Colaboradores", data.get("colaboradores")],
      ["Servicio de interes", data.get("servicio")],
      ["Estado de informacion salarial", data.get("estado_datos")],
      ["Plazo estimado", data.get("plazo")],
      ["Presupuesto aproximado", data.get("presupuesto")],
      ["Canal preferido de contacto", data.get("canal_contacto")],
      ["Principal necesidad", data.get("necesidad")]
    ];

    const submittedAt = new Date().toLocaleString("es-PE", {
      dateStyle: "medium",
      timeStyle: "short"
    });

    const body = [
      `Fecha de consulta: ${submittedAt}`,
      "",
      ...entries
        .map(([label, value]) => `${label}: ${value || "No especificado"}`)
    ].join("\n");

    status.textContent = "Procesando envío...";
    status.className = "form-status";

    const formData = new URLSearchParams(data).toString();

    // Enviar datos por fetch a Netlify
    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData
    })
      .then(() => {
        // Envío exitoso
        status.textContent = "¡Solicitud registrada! Preparando tu aplicación de correo y tu archivo de resumen...";
        status.classList.add("success");

        triggerOutputs(body, data);
      })
      .catch((error) => {
        console.warn("Netlify Forms falló. Iniciando envío directo cliente-servidor:", error);
        status.textContent = "Enlace listo. Se abrirá tu aplicación de correo y podrás descargar el resumen.";
        status.classList.add("success");

        triggerOutputs(body, data);
      });
  });

  function triggerOutputs(bodyText, formDataObj) {
    // Generar archivo txt para descarga
    const file = new Blob([bodyText], { type: "text/plain;charset=utf-8" });
    const fileUrl = URL.createObjectURL(file);
    if (downloadLead) {
      downloadLead.href = fileUrl;
      downloadLead.hidden = false;
    }

    // Configurar enlace mailto
    const subject = `Consulta salarial - ${formDataObj.get("empresa") || "Solicitud de Cliente"}`;
    const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;

    // Redirigir al mailto transcurrido un segundo para no interrumpir
    setTimeout(() => {
      window.location.href = mailto;
    }, 1000);
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

  const whatsappLinks = document.querySelectorAll('a[href*="wa.me/51931697778"]');
  whatsappLinks.forEach(link => {
    const textMsg = encodeURIComponent("Hola Percy, me contacto desde tu landing page para solicitar un diagnóstico de mi estructura salarial.");
    link.href = `https://wa.me/${CONTACT_WHATSAPP}?text=${textMsg}`;
  });
}

// INICIADOR DE ANIMACIONES SUB-VISUALES AL HACER SCROLL (INTERACTION OBSERVER)
function setupScrollAnimations() {
  if (prefersReduced) return;
  const cards = document.querySelectorAll(".service-card, .case-card, .step, .contact-item, .accordion-item");

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
  if (drawSalaryHero && drawModelPanel) {
    animate(performance.now());
  }
});

// EVALUADOR DE RIESGO DE CUMPLIMIENTO LEY 30709
function setupRiskEvaluator() {
  const btn = document.getElementById("btnCheckRisk");
  const resultDiv = document.getElementById("riskResult");
  const badge = document.getElementById("riskBadge");
  const textField = document.getElementById("riskText");

  if (!btn) return;

  btn.addEventListener("click", () => {
    const q1 = document.querySelector('input[name="q1"]:checked');
    const q2 = document.querySelector('input[name="q2"]:checked');
    const q3 = document.querySelector('input[name="q3"]:checked');

    if (!q1 || !q2 || !q3) {
      alert("Por favor, responde las 3 preguntas antes de calcular tu nivel de riesgo.");
      return;
    }

    resultDiv.hidden = false;
    const hasHighRisk = q1.value === "no" || q2.value === "no" || q3.value === "no";

    if (hasHighRisk) {
      resultDiv.className = "risk-result high";
      badge.textContent = "ALTO RIESGO / INCUMPLIMIENTO NOMINAL";
      textField.innerHTML = "Tu organización está expuesta a <strong>sanciones severas y multas acumulativas por parte de SUNAFIL</strong>. Carecer de un Cuadro de Categorías y Funciones valorado, de una política salarial escrita comunicada o de justificaciones estadísticas objetivas infringe de forma grave la Ley 30709.";
    } else {
      resultDiv.className = "risk-result low";
      badge.textContent = "RIESGO BAJO / CUMPLIMIENTO BASE";
      textField.innerHTML = "¡Excelente! Tu estructura reporta un cumplimiento óptimo de los requisitos base de la Ley 30709. Te recomendamos desarrollar auditorías analíticas anuales en Excel o Python para asegurar que las nuevas contrataciones no introduzcan distorsiones salariales imprevistas.";
    }

    resultDiv.scrollIntoView({ behavior: "smooth", block: "nearest" });
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
  setupAccordion();
  setupRiskEvaluator();
  animate(performance.now());
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp);
} else {
  initializeApp();
}
