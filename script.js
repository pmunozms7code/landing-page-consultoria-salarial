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
  if (drawSalaryHero && drawModelPanel) {
    animate(performance.now());
  }
});

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
  setupHeroBackgroundVideo();
  animate(performance.now());
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp);
} else {
  initializeApp();
}
