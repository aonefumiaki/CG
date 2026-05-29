
  // ── Scroll reveal ──
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if(e.isIntersecting){e.target.classList.add('visible');revealObs.unobserve(e.target);} });
  }, { threshold: 0.1 });

  // ── Admin state ──
  const ADMIN_PASSWORD = 'cowgirl2025';
  const CAST_DATA = [
    { name: 'キャスト1', role: 'Staff' },
    { name: 'キャスト2', role: 'Staff' },
    { name: 'キャスト3', role: 'Staff' },
    { name: 'キャスト4', role: 'Staff' },
  ];

  // ── Admin login ──
  function showAdminLogin() {
    document.getElementById('admin-overlay').style.display = 'block';
    document.getElementById('admin-login').style.display = 'flex';
    document.getElementById('admin-dashboard').style.display = 'none';
    document.getElementById('admin-login-err').style.display = 'none';
    document.getElementById('admin-pw-input').value = '';
    setTimeout(() => document.getElementById('admin-pw-input').focus(), 100);
  }

  function checkAdminLogin() {
    if (document.getElementById('admin-pw-input').value === ADMIN_PASSWORD) {
      document.getElementById('admin-login').style.display = 'none';
      document.getElementById('admin-dashboard').style.display = 'block';
      initCastEditor();
      loadStoreEdits();
      loadConceptEdits();
      loadNoticeEdits();
      initLayout();
      loadAnalyticsDashboard();
      showEditSection('store');
    } else {
      document.getElementById('admin-login-err').style.display = 'block';
      document.getElementById('admin-pw-input').value = '';
      document.getElementById('admin-pw-input').focus();
    }
  }

  function closeAdmin() {
    document.getElementById('admin-overlay').style.display = 'none';
  }

  // ── Tab switching ──
  function showEditSection(name) {
    const sections = ['cast','store','notice','concept','analytics','layout'];
    sections.forEach(s => {
      document.getElementById('esec-'+s).style.display = s === name ? 'block' : 'none';
      const tab = document.getElementById('etab-'+s);
      if (s === name) {
        tab.style.background = '#2a1f18'; tab.style.color = 'white'; tab.style.borderColor = '#2a1f18';
      } else {
        tab.style.background = 'transparent'; tab.style.color = '#9a8878'; tab.style.borderColor = 'rgba(140,112,96,0.18)';
      }
    });
    if (name === 'analytics') loadAnalyticsDashboard();
  }

  // ── Cast editor ──
  function initCastEditor() {
    const saved = JSON.parse(localStorage.getItem('noir_cast') || 'null') || CAST_DATA;
    const container = document.getElementById('cast-editor');
    container.innerHTML = '';
    const labelStyle = "font-family:'DM Sans',sans-serif;font-size:0.55rem;letter-spacing:0.2em;color:var(--muted);text-transform:uppercase;display:block;margin-bottom:6px;";
    const inputStyle = 'width:100%;background:var(--surface);border:1px solid var(--border);color:var(--text);font-size:0.9rem;padding:8px 12px;outline:none;';
    saved.forEach((cast, i) => {
      const row = document.createElement('div');
      row.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:16px;border:1px solid var(--border);background:var(--deep);';
      const nameDiv = document.createElement('div');
      const nameLbl = document.createElement('label');
      nameLbl.style.cssText = labelStyle;
      nameLbl.textContent = 'キャスト' + (i+1) + ' 名前';
      const nameInp = document.createElement('input');
      nameInp.dataset.castName = i;
      nameInp.value = cast.name;
      nameInp.style.cssText = inputStyle;
      nameDiv.appendChild(nameLbl);
      nameDiv.appendChild(nameInp);
      const roleDiv = document.createElement('div');
      const roleLbl = document.createElement('label');
      roleLbl.style.cssText = labelStyle;
      roleLbl.textContent = '役職';
      const roleInp = document.createElement('input');
      roleInp.dataset.castRole = i;
      roleInp.value = cast.role;
      roleInp.style.cssText = inputStyle;
      roleDiv.appendChild(roleLbl);
      roleDiv.appendChild(roleInp);
      row.appendChild(nameDiv);
      row.appendChild(roleDiv);
      container.appendChild(row);
    });
  }


  function saveCastEdits() {
    const newData = [];
    for (let i = 0; i < 4; i++) {
      const nameEl = document.querySelector('[data-cast-name="'+i+'"]');
      const roleEl = document.querySelector('[data-cast-role="'+i+'"]');
      if (!nameEl) continue;
      const name = nameEl.value.trim();
      const role = roleEl.value.trim();
      newData.push({ name, role });
      const nameDiv = document.getElementById('site-cast-name-' + i);
      const roleDiv = document.getElementById('site-cast-role-' + i);
      if (nameDiv) nameDiv.textContent = name;
      if (roleDiv) roleDiv.textContent = role;
    }
    localStorage.setItem('noir_cast', JSON.stringify(newData));
    const msg = document.getElementById('cast-save-msg');
    msg.style.display = 'block'; setTimeout(() => msg.style.display = 'none', 2000);
  }

  // ── Store editor ──
  function loadStoreEdits() {
    const d = JSON.parse(localStorage.getItem('noir_store') || '{}');
    const fields = ['name','address','hours','access','dress','price','tel','gmap','lineUrl'];
    fields.forEach(f => {
      const el = document.getElementById('edit-' + f);
      const siteEl = document.getElementById('site-info-' + f);
      if (d[f]) {
        if (el) el.value = d[f];
        if (siteEl) siteEl.innerHTML = d[f].replace(/\n/g, '<br>');
      } else if (siteEl && el) {
        el.value = siteEl.innerText || siteEl.textContent;
      }
    });
  }

  function saveStoreEdits() {
    const fields = ['name','address','hours','access','dress','price','tel'];
    const d = {};
    fields.forEach(f => {
      const el = document.getElementById('edit-' + f);
      if (!el) return;
      d[f] = el.value.trim();
      const siteEl = document.getElementById('site-info-' + f);
      if (siteEl) siteEl.innerHTML = d[f].replace(/\n/g, '<br>');
    });
    // Update gmap
    if (d.gmap) {
      const iframe = document.getElementById('site-gmap');
      if (iframe) iframe.src = d.gmap;
    }
    // Update LINE float URL
    if (d.lineUrl) {
      const lineLink = document.getElementById('line-float-link');
      if (lineLink) lineLink.href = d.lineUrl;
    }
    // Update tel link
    if (d.tel) {
      const telLink = document.querySelector('.reservation-tel') || document.getElementById('site-info-tel-link');
      if (telLink) { telLink.href = 'tel:' + d.tel; telLink.textContent = d.tel; }
    }
    localStorage.setItem('noir_store', JSON.stringify(d));
    const msg = document.getElementById('store-save-msg');
    msg.style.display = 'block'; setTimeout(() => msg.style.display = 'none', 2000);
  }

  // ── Concept editor ──
  function loadConceptEdits() {
    const d = JSON.parse(localStorage.getItem('noir_concept') || '{}');
    if (d.heroEm) {
      document.getElementById('edit-hero-em').value = d.heroEm;
      const em = document.getElementById('site-hero-em');
      if (em) em.textContent = d.heroEm;
    }
    if (d.heroSub) {
      document.getElementById('edit-hero-sub').value = d.heroSub;
      const sub = document.getElementById('site-hero-sub');
      if (sub) sub.innerHTML = d.heroSub.replace(/\n/g, '<br>');
    }
    if (d.conceptBody) {
      document.getElementById('edit-concept-body').value = d.conceptBody;
      const body = document.getElementById('site-concept-body');
      if (body) body.textContent = d.conceptBody;
    }
    // Init placeholders from current site
    if (!d.heroEm) {
      const em = document.getElementById('site-hero-em');
      if (em) document.getElementById('edit-hero-em').value = em.textContent;
    }
    if (!d.conceptBody) {
      const body = document.getElementById('site-concept-body');
      if (body) document.getElementById('edit-concept-body').value = body.textContent;
    }
  }

  function saveConceptEdits() {
    const heroEm = document.getElementById('edit-hero-em').value.trim();
    const heroSub = document.getElementById('edit-hero-sub').value.trim();
    const conceptBody = document.getElementById('edit-concept-body').value.trim();
    if (heroEm) {
      const em = document.getElementById('site-hero-em');
      if (em) em.textContent = heroEm;
    }
    if (heroSub) {
      const sub = document.getElementById('site-hero-sub');
      if (sub) sub.innerHTML = heroSub.replace(/\n/g, '<br>');
    }
    if (conceptBody) {
      const body = document.getElementById('site-concept-body');
      if (body) body.textContent = conceptBody;
    }
    localStorage.setItem('noir_concept', JSON.stringify({ heroEm, heroSub, conceptBody }));
    const msg = document.getElementById('concept-save-msg');
    msg.style.display = 'block'; setTimeout(() => msg.style.display = 'none', 2000);
  }

  // ── Notice editor ──
  function loadNoticeEdits() {
    const d = JSON.parse(localStorage.getItem('noir_notice') || '{}');
    if (d.text) document.getElementById('notice-text-input').value = d.text;
    if (d.active) {
      document.getElementById('notice-active').checked = true;
      showNoticeBanner(d.text);
    }
  }

  function toggleNoticePreview() {
    const active = document.getElementById('notice-active').checked;
    const text = document.getElementById('notice-text-input').value.trim();
    if (active && text) showNoticeBanner(text);
    else hideNoticeBanner();
  }

  function updateNoticePreview() {
    if (document.getElementById('notice-active').checked) {
      showNoticeBanner(document.getElementById('notice-text-input').value);
    }
  }

  function showNoticeBanner(text) {
    const banner = document.getElementById('site-notice-banner');
    document.getElementById('site-notice-text').textContent = text;
    banner.style.display = 'block';
  }

  function hideNoticeBanner() {
    document.getElementById('site-notice-banner').style.display = 'none';
  }

  function saveNoticeEdits() {
    const text = document.getElementById('notice-text-input').value.trim();
    const active = document.getElementById('notice-active').checked;
    localStorage.setItem('noir_notice', JSON.stringify({ text, active }));
    if (active && text) showNoticeBanner(text); else hideNoticeBanner();
    const msg = document.getElementById('notice-save-msg');
    msg.style.display = 'block'; setTimeout(() => msg.style.display = 'none', 2000);
  }

  // ── Analytics ──
  const SECTIONS_TRACK = ['hero','concept','features','info','recruit','reservation'];

  function getAnalyticsData() {
    return JSON.parse(localStorage.getItem('noir_analytics') || '{"visits":[],"lineClicks":0,"scrollDepth":{},"bounces":0}');
  }

  function saveAnalyticsData(d) {
    localStorage.setItem('noir_analytics', JSON.stringify(d));
  }

  function recordVisit() {
    const d = getAnalyticsData();
    const today = new Date().toISOString().slice(0,10);
    d.visits = d.visits || [];
    const existing = d.visits.find(v => v.date === today);
    if (existing) { existing.count++; } else { d.visits.push({ date: today, count: 1 }); }
    if (d.visits.length > 30) d.visits = d.visits.slice(-30);
    // bounce tracking: mark as bounced unless engaged
    d._sessionStart = Date.now();
    d._bounced = true;
    saveAnalyticsData(d);
    setTimeout(() => {
      const d2 = getAnalyticsData();
      if (d2._bounced) { d2.bounces = (d2.bounces || 0) + 1; d2._bounced = false; saveAnalyticsData(d2); }
    }, 30000); // 30秒滞在で直帰扱い解除
  }

  function markEngaged() {
    const d = getAnalyticsData();
    d._bounced = false;
    saveAnalyticsData(d);
  }

  function recordLineClick() {
    const d = getAnalyticsData();
    d.lineClicks = (d.lineClicks || 0) + 1;
    saveAnalyticsData(d);
    markEngaged();
  }

  function recordScrollDepth(sectionId) {
    const d = getAnalyticsData();
    d.scrollDepth = d.scrollDepth || {};
    d.scrollDepth[sectionId] = (d.scrollDepth[sectionId] || 0) + 1;
    saveAnalyticsData(d);
    markEngaged();
  }

  function loadAnalyticsDashboard() {
    const d = getAnalyticsData();
    // Total visits
    const totalVisits = (d.visits || []).reduce((s,v) => s + v.count, 0);
    document.getElementById('stat-visits').textContent = totalVisits || 0;
    // Bounce rate
    const bounceRate = totalVisits > 0 ? Math.round((d.bounces || 0) / totalVisits * 100) : 0;
    document.getElementById('stat-bounce').textContent = bounceRate + '%';
    // LINE clicks
    document.getElementById('stat-line-clicks').textContent = d.lineClicks || 0;
    // Chart: last 7 days
    const chart = document.getElementById('analytics-chart');
    const labels = document.getElementById('analytics-chart-labels');
    chart.innerHTML = ''; labels.innerHTML = '';
    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const dt = new Date(); dt.setDate(dt.getDate() - i);
      const key = dt.toISOString().slice(0,10);
      const found = (d.visits || []).find(v => v.date === key);
      last7.push({ date: key, count: found ? found.count : 0, label: (dt.getMonth()+1)+'/'+(dt.getDate()) });
    }
    const maxCount = Math.max(...last7.map(v => v.count), 1);
    last7.forEach(v => {
      const bar = document.createElement('div');
      const pct = Math.max(v.count / maxCount * 100, 2);
      bar.style.cssText = 'flex:1;background:var(--gold);opacity:0.7;border-radius:2px 2px 0 0;transition:height 0.4s;height:' + pct + '%;position:relative;';
      bar.title = v.label + ': ' + v.count + '件';
      chart.appendChild(bar);
      const lbl = document.createElement('div');
      lbl.style.cssText = "flex:1;text-align:center;font-family:'DM Sans',sans-serif;font-size:0.48rem;color:var(--muted);";
      lbl.textContent = v.label;
      labels.appendChild(lbl);
    });
    // Scroll depth
    const depthList = document.getElementById('scroll-depth-list');
    depthList.innerHTML = '';
    const sectionLabels = { hero:'ヒーロー', concept:'コンセプト', features:'特徴', cast:'キャスト', info:'店舗情報', reservation:'予約' };
    const heroCount = (d.scrollDepth || {})['hero'] || totalVisits;
    SECTIONS_TRACK.forEach(id => {
      const count = (d.scrollDepth || {})[id] || 0;
      const pct = heroCount > 0 ? Math.round(count / heroCount * 100) : 0;
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:12px;';
      row.innerHTML = (
        '<div style="width:80px;font-size:0.58rem;color:var(--muted);text-align:right;flex-shrink:0;">' + (sectionLabels[id]||id) + '</div>' +
        '<div style="flex:1;background:var(--deep);border:1px solid var(--border);height:12px;border-radius:2px;overflow:hidden;">' +
          '<div style="width:' + pct + '%;height:100%;background:var(--gold);opacity:0.7;"></div>' +
        '</div>' +
        '<div style="width:36px;font-size:0.58rem;color:var(--gold);text-align:right;">' + pct + '%</div>'
      );
      depthList.appendChild(row);
    });
  }

  function clearAnalytics() {
    if (!confirm('アクセスデータをリセットしますか？')) return;
    localStorage.removeItem('noir_analytics');
    loadAnalyticsDashboard();
  }

  // ── LINE Floating Button ──
  function initLineFloat() {
    const btn = document.getElementById('line-float');
    const link = document.getElementById('line-float-link');
    // Load LINE URL from storage
    const saved = JSON.parse(localStorage.getItem('noir_store') || '{}');
    if (saved.lineUrl) link.href = saved.lineUrl;

    // Track clicks
    link.addEventListener('click', () => { recordLineClick(); });

    // Scroll show/hide
    let shown = false;
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const threshold = window.innerHeight * 0.4;
      if (scrollY > threshold && !shown) {
        btn.style.opacity = '1';
        btn.style.transform = 'translateY(0)';
        btn.style.pointerEvents = 'auto';
        shown = true;
      } else if (scrollY <= threshold && shown) {
        btn.style.opacity = '0';
        btn.style.transform = 'translateY(16px)';
        btn.style.pointerEvents = 'none';
        shown = false;
      }
    }, { passive: true });
  }

  // ── Scroll depth tracking ──
  function initScrollTracking() {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const id = e.target.id;
          if (SECTIONS_TRACK.includes(id)) recordScrollDepth(id);
        }
      });
    }, { threshold: 0.3 });
    SECTIONS_TRACK.forEach(id => {
      const el = document.getElementById(id);
      if (el) sectionObserver.observe(el);
    });
  }

  // ── Layout Manager ──
  const SECTION_META = [
    { id: 'hero',        label: 'ヒーロー（メインビジュアル）', required: true },
    { id: 'concept',     label: 'コンセプト' },
    { id: 'features',    label: '特徴・こだわり（6項目）' },
    { id: 'info',        label: '店舗情報' },
    { id: 'recruit',     label: '求人セクション' },
    { id: 'reservation', label: 'ご予約' },
  ];

  let layoutOrder   = SECTION_META.map(s => s.id);
  let layoutVisible = Object.fromEntries(SECTION_META.map(s => [s.id, true]));
  let dragSrcIndex  = null;

  function initLayout() {
    const saved = JSON.parse(localStorage.getItem('noir_layout') || 'null');
    if (saved) {
      layoutOrder   = saved.order   || layoutOrder;
      layoutVisible = saved.visible || layoutVisible;
    }
    renderLayoutList();
  }

  function renderLayoutList() {
    const list = document.getElementById('layout-list');
    list.innerHTML = '';
    layoutOrder.forEach((id, idx) => {
      const meta = SECTION_META.find(s => s.id === id);
      if (!meta) return;
      const visible = layoutVisible[id] !== false;

      const row = document.createElement('div');
      row.draggable = !meta.required;
      row.dataset.idx = idx;
      row.style.cssText = [
        'display:flex;align-items:center;gap:16px;padding:14px 16px;',
        'background:' + (visible ? 'var(--deep)' : 'rgba(255,255,255,0.02)') + ';',
        'border:1px solid ' + (visible ? 'var(--border)' : 'rgba(255,255,255,0.05)') + ';',
        'cursor:' + (meta.required ? 'default' : 'grab') + ';',
        'transition:all 0.2s;user-select:none;',
        'opacity:' + (visible ? '1' : '0.45') + ';',
      ].join('');

      // Drag handle
      const handle = document.createElement('div');
      handle.style.cssText = 'font-size:1rem;color:' + (meta.required ? 'transparent' : 'var(--gold-dim)') + ';flex-shrink:0;cursor:inherit;line-height:1;';
      handle.textContent = '⠿';

      // Label
      const label = document.createElement('div');
      label.style.cssText = "flex:1;font-family:'Noto Serif JP',serif;font-size:0.9rem;color:var(--text);";
      label.textContent = meta.label;

      // Required badge
      if (meta.required) {
        const badge = document.createElement('span');
        badge.style.cssText = "font-family:'DM Sans',sans-serif;font-size:0.5rem;letter-spacing:0.2em;color:var(--gold-dim);border:1px solid var(--gold-dim);padding:2px 8px;text-transform:uppercase;";
        badge.textContent = '固定';
        label.appendChild(badge);
      }

      // Toggle
      const toggle = document.createElement('label');
      toggle.style.cssText = 'position:relative;display:inline-block;width:44px;height:24px;flex-shrink:0;cursor:pointer;';
      toggle.title = meta.required ? 'ヒーローは非表示にできません' : '';
      const inp = document.createElement('input');
      inp.type = 'checkbox';
      inp.checked = visible;
      inp.disabled = !!meta.required;
      inp.style.cssText = 'opacity:0;width:0;height:0;position:absolute;';
      inp.onchange = () => {
        layoutVisible[id] = inp.checked;
        renderLayoutList();
      };
      const slider = document.createElement('span');
      slider.style.cssText = [
        'position:absolute;inset:0;border-radius:24px;transition:0.3s;',
        'background:' + (visible && !meta.required ? 'var(--gold)' : 'var(--border)') + ';',
      ].join('');
      const knob = document.createElement('span');
      knob.style.cssText = [
        'position:absolute;width:18px;height:18px;border-radius:50%;background:white;',
        'top:3px;transition:0.3s;',
        'left:' + (visible ? '23px' : '3px') + ';',
      ].join('');
      slider.appendChild(knob);
      toggle.appendChild(inp);
      toggle.appendChild(slider);

      // Drag events
      if (!meta.required) {
        row.addEventListener('dragstart', e => {
          dragSrcIndex = idx;
          e.dataTransfer.effectAllowed = 'move';
          setTimeout(() => row.style.opacity = '0.3', 0);
        });
        row.addEventListener('dragend', () => {
          row.style.opacity = '';
          renderLayoutList();
        });
        row.addEventListener('dragover', e => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          row.style.borderColor = 'var(--gold)';
        });
        row.addEventListener('dragleave', () => {
          row.style.borderColor = visible ? 'var(--border)' : 'rgba(255,255,255,0.05)';
        });
        row.addEventListener('drop', e => {
          e.preventDefault();
          if (dragSrcIndex === null || dragSrcIndex === idx) return;
          const moved = layoutOrder.splice(dragSrcIndex, 1)[0];
          layoutOrder.splice(idx, 0, moved);
          dragSrcIndex = null;
          renderLayoutList();
        });
      }

      row.appendChild(handle);
      row.appendChild(label);
      row.appendChild(toggle);
      list.appendChild(row);
    });
  }

  function applyLayout() {
    const main = document.querySelector('body');
    const allWrappers = layoutOrder.map(id => document.getElementById('wrapper-' + id)).filter(Boolean);

    // hero is outside wrapper system — handle separately
    const heroWrapper = document.getElementById('wrapper-hero');
    if (heroWrapper) {
      heroWrapper.style.display = layoutVisible['hero'] === false ? 'none' : '';
    }

    // For non-hero sections, reorder DOM and set visibility
    const parent = document.getElementById('wrapper-concept')?.parentElement;
    if (!parent) return;

    layoutOrder.forEach(id => {
      if (id === 'hero') return;
      const el = document.getElementById('wrapper-' + id);
      if (!el) return;
      el.style.display = layoutVisible[id] === false ? 'none' : '';
      parent.appendChild(el); // reorder by appending in order
    });

    localStorage.setItem('noir_layout', JSON.stringify({ order: layoutOrder, visible: layoutVisible }));
    const msg = document.getElementById('layout-save-msg');
    msg.style.display = 'block';
    setTimeout(() => msg.style.display = 'none', 2000);
  }

  function resetLayout() {
    layoutOrder   = SECTION_META.map(s => s.id);
    layoutVisible = Object.fromEntries(SECTION_META.map(s => [s.id, true]));
    localStorage.removeItem('noir_layout');
    applyLayout();
    renderLayoutList();
  }

  // ── On page load: apply saved data ──
  window.addEventListener('load', () => {
    // Hash-based admin access
    if (window.location.hash === '#admin') {
      showAdminLogin();
      history.replaceState(null, '', window.location.pathname);
    }

    // Scroll reveal
    document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

    // Analytics
    recordVisit();
    initLineFloat();
    initScrollTracking();

    // Apply saved layout
    const savedLayout = JSON.parse(localStorage.getItem('noir_layout') || 'null');
    if (savedLayout) {
      layoutOrder   = savedLayout.order   || layoutOrder;
      layoutVisible = savedLayout.visible || layoutVisible;
      applyLayout();
    }
    // Cast
    const savedCast = JSON.parse(localStorage.getItem('noir_cast') || 'null');
    if (savedCast) {
      savedCast.forEach((cast, i) => {
        const nameEl = document.getElementById('site-cast-name-' + i);
        const roleEl = document.getElementById('site-cast-role-' + i);
        if (nameEl) nameEl.textContent = cast.name;
        if (roleEl) roleEl.textContent = cast.role;
      });
    }
    // Store
    const savedStore = JSON.parse(localStorage.getItem('noir_store') || '{}');
    const storeFields = ['name','address','hours','access','dress','price'];
    storeFields.forEach(f => {
      if (savedStore[f]) {
        const el = document.getElementById('site-info-' + f);
        if (el) el.innerHTML = savedStore[f].replace(/\n/g, '<br>');
      }
    });
    if (savedStore.gmap) {
      const iframe = document.getElementById('site-gmap');
      if (iframe) iframe.src = savedStore.gmap;
    }
    if (savedStore.lineUrl) {
      const lineLink = document.getElementById('line-float-link');
      if (lineLink) lineLink.href = savedStore.lineUrl;
    }
    if (savedStore.tel) {
      const telLink = document.querySelector('.reservation-tel') || document.getElementById('site-info-tel-link');
      if (telLink) { telLink.href = 'tel:' + savedStore.tel; telLink.textContent = savedStore.tel; }
    }
    // Concept
    const savedConcept = JSON.parse(localStorage.getItem('noir_concept') || '{}');
    if (savedConcept.heroEm) { const em = document.getElementById('site-hero-em'); if(em) em.textContent = savedConcept.heroEm; }
    if (savedConcept.heroSub) { const sub = document.getElementById('site-hero-sub'); if(sub) sub.innerHTML = savedConcept.heroSub.replace(/\n/g,'<br>'); }
    if (savedConcept.conceptBody) { const body = document.getElementById('site-concept-body'); if(body) body.textContent = savedConcept.conceptBody; }
    // Notice
    const savedNotice = JSON.parse(localStorage.getItem('noir_notice') || '{}');
    if (savedNotice.active && savedNotice.text) showNoticeBanner(savedNotice.text);
  });
  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#admin') {
      showAdminLogin();
      history.replaceState(null, '', window.location.pathname);
    }
  });

