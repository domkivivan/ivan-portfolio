/* Live table-map widget — a working slice of the OASIS booking UI.
   Standalone: local state only, no network. Layout mirrors the real floor. */

document.addEventListener('DOMContentLoaded', function () {
  const root = document.getElementById('table-widget');
  if (!root) return;

  /* Mirrors the real OASIS main hall: sofas 3–5, rounds 1–2, bar 1–5, PS 1–2 */
  const tables = [
    { id: 'T1', label: '1', kind: 'round', busy: false },
    { id: 'T2', label: '2', kind: 'round-big', busy: true },
    { id: 'T3', label: '3', kind: 'sofa', busy: false },
    { id: 'T4', label: '4', kind: 'sofa', busy: false },
    { id: 'T5', label: '5', kind: 'sofa', busy: true },
    { id: 'B1', label: 'bar 1', kind: 'bar', busy: false },
    { id: 'B2', label: 'bar 2', kind: 'bar', busy: false },
    { id: 'B3', label: 'bar 3', kind: 'bar', busy: true },
    { id: 'PS1', label: 'PS 1', kind: 'ps', busy: false },
    { id: 'PS2', label: 'PS 2', kind: 'ps', busy: false }
  ];

  let selected = null;

  root.innerHTML =
    '<div class="tw">' +
      '<div class="tw__floor" role="group" aria-label="Table map — demo">' +
        '<span class="tw__entrance mono">entrance</span>' +
        '<div class="tw__zone tw__zone--sofas">' +
          btn('T3') + btn('T4') + btn('T5') +
        '</div>' +
        '<div class="tw__zone tw__zone--center">' +
          btn('T1') + btn('T2') +
        '</div>' +
        '<div class="tw__zone tw__zone--bar">' +
          btn('B1') + btn('B2') + btn('B3') +
        '</div>' +
        '<div class="tw__zone tw__zone--ps">' +
          btn('PS1') + btn('PS2') +
        '</div>' +
      '</div>' +
      '<div class="tw__side">' +
        '<div class="tw__legend mono">' +
          '<span class="tw__key tw__key--free">free</span>' +
          '<span class="tw__key tw__key--busy">taken</span>' +
          '<span class="tw__key tw__key--sel">yours</span>' +
        '</div>' +
        '<p class="tw__status" id="tw-status">Pick a free table.</p>' +
        '<p class="tw__note mono">demo — the production version talks to a live database</p>' +
      '</div>' +
    '</div>';

  function btn(id) {
    const t = tables.find(function (x) { return x.id === id; });
    return '<button class="tw__table tw__table--' + t.kind +
      (t.busy ? ' is-busy' : '') + '" data-id="' + t.id + '"' +
      (t.busy ? ' aria-disabled="true"' : '') +
      ' aria-label="Table ' + t.label + (t.busy ? ' — taken' : ' — free') + '">' +
      t.label + '</button>';
  }

  const status = root.querySelector('#tw-status');

  root.addEventListener('click', function (e) {
    const el = e.target.closest('.tw__table');
    if (!el) return;
    const t = tables.find(function (x) { return x.id === el.dataset.id; });
    if (t.busy) {
      status.textContent = 'Table ' + t.label + ' is taken tonight — pick another.';
      return;
    }
    root.querySelectorAll('.tw__table.is-selected').forEach(function (b) {
      b.classList.remove('is-selected');
    });
    if (selected === t.id) {
      selected = null;
      status.textContent = 'Pick a free table.';
      return;
    }
    selected = t.id;
    el.classList.add('is-selected');
    status.innerHTML = 'Table <strong>' + t.label + '</strong> · tonight 21:00 — held for you. ' +
      'In the real app this confirms in one more tap.';
  });
});
