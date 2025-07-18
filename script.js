let carData = [];
let feeRate = 5;
let conditionRate = 10;
let isAdminLoggedIn = false;

document.addEventListener('DOMContentLoaded', () => {
  loadCars();
  setupNavigation();
  setupCalculator();
  setupAdminLogin();
  setupManageData();
  setupAdjustmentRate();
  showPage('calculator');
});

function setupNavigation() {
  document.getElementById('calculatorLink').onclick = e => { e.preventDefault(); showPage('calculator'); };
  document.getElementById('carDatabaseLink').onclick = e => { e.preventDefault(); showPage('carDatabase'); populatePublicCarTable(); };
  document.getElementById('manageDataLink').onclick = e => { e.preventDefault(); showPage('manageData'); };
  document.getElementById('adjustmentRateLink').onclick = e => { e.preventDefault(); showPage('adjustmentRate'); };

  document.getElementById('mobileMenuButton')?.addEventListener('click', () => {
    document.getElementById('mobileMenu').classList.toggle('hidden');
  });

  document.querySelectorAll('.mobile-nav').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.dataset.target;
      showPage(target);
      if (target === 'carDatabase') populatePublicCarTable();
    });
  });

  ['filterBrand', 'filterDetail', 'filterYear'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', populatePublicCarTable);
  });
}

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  document.getElementById(pageId).classList.remove('hidden');

  if (pageId === 'manageData' && !isAdminLoggedIn) {
    document.getElementById('adminLoginOverlay').classList.remove('hidden');
    document.getElementById('manageDataContent').classList.add('hidden');
  }
}

function loadCars() {
  fetch("https://sheetdb.io/api/v1/4z82od6vxzz7h?sheet=car_database")
    .then(res => res.json())
    .then(data => {
      carData = data;
      populateCarTable();
      populatePublicCarTable();
    })
    .catch(err => console.error("Failed to load car data:", err));
}

function populateCarTable() {
  const tbody = document.getElementById('carTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';
  carData.forEach((car) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="px-4 py-2 border">${car.brand}</td>
      <td class="px-4 py-2 border">${car.detail}</td>
      <td class="px-4 py-2 border">${car.year}</td>
      <td class="px-4 py-2 border">
        <button class="text-red-600 hover:text-red-800 delete-btn" data-id="${car.ID}">Delete</button>
      </td>`;
    tbody.appendChild(row);
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      if (confirm("Delete this car?")) {
        fetch(`https://sheetdb.io/api/v1/4z82od6vxzz7h/ID/${id}?sheet=car_database`, { method: 'DELETE' })
          .then(() => {
            alert("Deleted");
            loadCars();
          });
      }
    };
  });

  document.getElementById('totalCarsAdmin').textContent = `(${carData.length} cars)`;
}

function populatePublicCarTable() {
  const tbody = document.getElementById('publicCarTableBody');
  const msg = document.getElementById('noResultsMessage');
  const count = document.getElementById('totalCarsPublic');

  const fBrand = document.getElementById('filterBrand')?.value.toLowerCase() || '';
  const fDetail = document.getElementById('filterDetail')?.value.toLowerCase() || '';
  const fYear = document.getElementById('filterYear')?.value.toLowerCase() || '';

  const filtered = carData.filter(car =>
    car.brand.toLowerCase().includes(fBrand) &&
    car.detail.toLowerCase().includes(fDetail) &&
    car.year.toLowerCase().includes(fYear)
  );

  tbody.innerHTML = '';

  if (filtered.length === 0) {
    msg.classList.remove('hidden');
  } else {
    msg.classList.add('hidden');
    filtered.forEach(car => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="px-4 py-2 border">${car.brand}</td>
        <td class="px-4 py-2 border">${car.detail}</td>
        <td class="px-4 py-2 border">${car.year}</td>`;
      tbody.appendChild(row);
    });
  }

  count.textContent = `(${filtered.length} cars)`;
}

function setupCalculator() {
  const calcBtn = document.getElementById('calculateButton');
  if (!calcBtn) return;

  calcBtn.addEventListener('click', () => {
    const brand = document.getElementById('brand').value;
    const detail = document.getElementById('detail').value;
    const year = document.getElementById('year').value;
    const useEst = document.getElementById('useEstimation').checked;
    const estPrice = parseFloat(document.getElementById('estimationPrice').value) || 0;

    const car = carData.find(c => c.brand === brand && c.detail === detail && c.year === year);

    if (car) {
      const fee = car.price * (feeRate / 100);
      const reduction = fee * (conditionRate / 100);
      document.getElementById('resultCar').textContent = `${car.brand} ${car.detail} (${car.year})`;
      document.getElementById('resultPrice').textContent = formatRupiah(car.price);
      document.getElementById('resultFeeRate').textContent = `${feeRate}%`;
      document.getElementById('resultConditionRate').textContent = `${conditionRate}%`;
      document.getElementById('resultFinalFee').textContent = formatRupiah(fee - reduction);
    }

    if (useEst && estPrice > 0) {
      const fee = estPrice * (feeRate / 100);
      const reduction = fee * (conditionRate / 100);
      document.getElementById('estResultPrice').textContent = formatRupiah(estPrice);
      document.getElementById('estResultFeeRate').textContent = `${feeRate}%`;
      document.getElementById('estResultConditionRate').textContent = `${conditionRate}%`;
      document.getElementById('estResultFinalFee').textContent = formatRupiah(fee - reduction);
      document.getElementById('estimationResult').classList.remove('hidden');
    } else {
      document.getElementById('estimationResult').classList.add('hidden');
    }
  });
}

function setupAdminLogin() {
  document.getElementById('adminLoginButton')?.addEventListener('click', () => {
    const pass = document.getElementById('adminLoginPassword').value;
    if (pass === 'Kreditplus') {
      isAdminLoggedIn = true;
      document.getElementById('adminLoginOverlay').classList.add('hidden');
      document.getElementById('manageDataContent').classList.remove('hidden');
      populateCarTable();
    } else {
      alert('Invalid password');
    }
  });

  document.getElementById('adminLoginCancelButton')?.addEventListener('click', () => {
    showPage('calculator');
  });
}

function setupManageData() {
  document.getElementById('addCarButton')?.addEventListener('click', () => {
    const brand = document.getElementById('newBrand').value.trim();
    const detail = document.getElementById('newDetail').value.trim();
    const year = document.getElementById('newYear').value.trim();
    const price = parseFloat(document.getElementById('newPrice').value);

    if (!brand || !detail || !year || isNaN(price)) return alert('Please fill valid values');

    const car = { ID: Date.now().toString(), brand, detail, year, price };
    fetch("https://sheetdb.io/api/v1/4z82od6vxzz7h?sheet=car_database", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: [car] })
    }).then(() => {
      alert('Car added');
      loadCars();
    });
  });

  document.getElementById('deleteAllCarsButton')?.addEventListener('click', () => {
    if (confirm("Delete ALL cars? This cannot be undone.")) {
      carData.forEach(car => {
        fetch(`https://sheetdb.io/api/v1/4z82od6vxzz7h/ID/${car.ID}?sheet=car_database`, { method: 'DELETE' });
      });
      alert("All cars deleted.");
      setTimeout(loadCars, 1000);
    }
  });
}

function setupAdjustmentRate() {
  document.getElementById('updateFeeRateButton')?.addEventListener('click', () => {
    const rate = parseFloat(document.getElementById('newFeeRate').value);
    const pass = document.getElementById('adminPassword').value;
    if (pass === 'Kreditplus' && !isNaN(rate)) {
      feeRate = rate;
      document.getElementById('currentFeeRate').textContent = `${feeRate}%`;
      alert('Fee rate updated');
    } else alert('Invalid input');
  });

  document.getElementById('updateConditionRateButton')?.addEventListener('click', () => {
    const rate = parseFloat(document.getElementById('newConditionRate').value);
    const pass = document.getElementById('assetPassword').value;
    if (pass === 'Asset' && !isNaN(rate)) {
      conditionRate = rate;
      document.getElementById('currentConditionRate').textContent = `${conditionRate}%`;
      alert('Condition rate updated');
    } else alert('Invalid input');
  });
}

function formatRupiah(num) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
}
