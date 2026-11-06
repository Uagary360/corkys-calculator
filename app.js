(function () {
  var FEE = 24000, MILESTONES = 4, PER = FEE / MILESTONES, CUSHION = 0.10;
  var SAMPLE = { aov: 130, food: 35, ship: 30, fees: 3, promo: 5, upfront: 5000, expected: 800 };
  var ids = Object.keys(SAMPLE);
  var el = {};
  ids.forEach(function (k) { el[k] = document.getElementById(k); });
  function $(id) { return document.getElementById(id); }
  var usd0 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  var usd2 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  var num = new Intl.NumberFormat('en-US');
  function val(k) { var v = parseFloat(el[k].value); return isFinite(v) && v >= 0 ? v : 0; }

  function calc() {
    var aov = val('aov'), food = val('food') / 100, ship = val('ship'), fees = val('fees') / 100, promo = val('promo'), exp = Math.round(val('expected'));
    var up = Math.min(val('upfront'), PER);
    var profit = aov - aov * food - ship - aov * fees - promo;
    var margin = aov > 0 ? profit / aov : 0;
    $('r-profit').textContent = usd2.format(profit);
    $('r-margin').textContent = (margin * 100).toFixed(1) + '%';
    var ok = profit > 0;
    $('r-warn').hidden = ok;
    var tbody = $('ms');
    tbody.innerHTML = '';
    if (!ok) {
      ['r-orders', 'r-week', 'r-month', 'r-final'].forEach(function (i) { $(i).textContent = '—'; });
      $('r-sales').textContent = '—';
      tbody.innerHTML = '<tr><td colspan="4">Enter costs that leave a profit on each order.</td></tr>';
      $('k-profit').textContent = usd0.format(Math.max(profit * exp, 0));
      $('k-paid').textContent = usd0.format(up);
      $('k-net').textContent = usd0.format(Math.max(profit * exp, 0) - up);
      $('k-exp').textContent = num.format(exp);
      return;
    }
    var be = Math.ceil(FEE / profit - 1e-9);
    $('r-orders').textContent = num.format(be);
    $('r-sales').textContent = usd0.format(be * aov);
    $('r-month').textContent = num.format(Math.ceil(be / 12));
    $('r-week').textContent = num.format(Math.ceil(be / 52));
    var target = Math.ceil(be * (1 + CUSHION) - 1e-9);
    $('r-final').textContent = num.format(target);
    var row0 = document.createElement('tr');
    row0.innerHTML = '<td>Start</td><td>Production fee<small class="ord">due at signing</small></td><td>—</td><td>' + usd0.format(up) + '</td>';
    if (up > 0) tbody.appendChild(row0);
    var thresholds = [];
    for (var m = 1; m <= MILESTONES; m++) {
      var orders = m === MILESTONES ? target : Math.ceil(target * m / MILESTONES - 1e-9);
      thresholds.push(orders);
      var tr = document.createElement('tr');
      tr.innerHTML = '<td>' + m + '</td><td>' + usd0.format(orders * aov) + '<small class="ord">about ' + num.format(orders) + ' orders</small></td><td>' +
        usd0.format(orders * profit) + '<small class="ord ahead">ahead by ' + usd0.format(orders * profit - m * PER) + '</small></td><td>' + usd0.format(m === 1 ? PER - up : PER) + (m === 1 && up > 0 ? '<small class="ord">after ' + usd0.format(up) + ' credit</small>' : '') + '</td>';
      tbody.appendChild(tr);
    }
    var reached = thresholds.filter(function (t) { return exp >= t; }).length;
    var earned = profit * exp, paid = Math.max(reached * PER, up);
    $('r-risk').textContent = up > 0 ? 'Corky\'s earns back the ' + usd0.format(up) + ' production fee at about ' + num.format(Math.ceil(up / profit - 1e-9)) + ' orders. Below the first milestone, the production fee is the only cost, and BPS refunds it in full if BPS cancels.' : 'Below the first milestone, Corky\'s pays $0 and keeps every dollar of profit from BPS orders.';
    $('k-exp').textContent = num.format(exp);
    $('k-profit').textContent = usd0.format(earned);
    $('k-paid').textContent = usd0.format(paid);
    $('k-net').textContent = usd0.format(earned - paid);
  }
  ids.forEach(function (k) { el[k].addEventListener('input', calc); });
  $('reset').addEventListener('click', function () { ids.forEach(function (k) { el[k].value = SAMPLE[k]; }); calc(); });
  calc();
})();
