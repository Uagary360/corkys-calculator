(function () {
  var FEE = 24000, MILESTONES = 4, PER = FEE / MILESTONES;
  var SAMPLE = { aov: 130, food: 35, ship: 30, fees: 3, promo: 5, expected: 800 };
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
    var profit = aov - aov * food - ship - aov * fees - promo;
    var margin = aov > 0 ? profit / aov : 0;
    $('r-profit').textContent = usd2.format(profit);
    $('r-margin').textContent = (margin * 100).toFixed(1) + '%';
    var ok = profit > 0;
    $('r-warn').hidden = ok;
    var tbody = $('ms');
    tbody.innerHTML = '';
    if (!ok) {
      ['r-orders', 'r-week', 'r-month'].forEach(function (i) { $(i).textContent = '—'; });
      $('r-sales').textContent = '—';
      tbody.innerHTML = '<tr><td colspan="4">Enter costs that leave a profit on each order.</td></tr>';
      $('k-profit').textContent = usd0.format(Math.max(profit * exp, 0));
      $('k-paid').textContent = usd0.format(0);
      $('k-net').textContent = usd0.format(Math.max(profit * exp, 0));
      $('k-exp').textContent = num.format(exp);
      return;
    }
    var be = Math.ceil(FEE / profit - 1e-9);
    $('r-orders').textContent = num.format(be);
    $('r-sales').textContent = usd0.format(be * aov);
    $('r-month').textContent = num.format(Math.ceil(be / 12));
    $('r-week').textContent = num.format(Math.ceil(be / 52));
    var thresholds = [];
    for (var m = 1; m <= MILESTONES; m++) {
      var orders = m === MILESTONES ? be : Math.ceil(be * m / MILESTONES);
      thresholds.push(orders);
      var tr = document.createElement('tr');
      tr.innerHTML = '<td>' + m + '</td><td>' + usd0.format(orders * aov) + '<small class="ord">about ' + num.format(orders) + ' orders</small></td><td>' +
        usd0.format(orders * profit) + '</td><td>' + usd0.format(PER) + '</td>';
      tbody.appendChild(tr);
    }
    var reached = thresholds.filter(function (t) { return exp >= t; }).length;
    var earned = profit * exp, paid = reached * PER;
    $('k-exp').textContent = num.format(exp);
    $('k-profit').textContent = usd0.format(earned);
    $('k-paid').textContent = usd0.format(paid);
    $('k-net').textContent = usd0.format(earned - paid);
  }
  ids.forEach(function (k) { el[k].addEventListener('input', calc); });
  $('reset').addEventListener('click', function () { ids.forEach(function (k) { el[k].value = SAMPLE[k]; }); calc(); });
  calc();
})();
