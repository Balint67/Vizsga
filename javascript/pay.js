    document.getElementById('payment-form').addEventListener('submit', function(e) {
    e.preventDefault();

    // Mezők
    const fields = {
    name: document.getElementById('full-name'),
    email: document.getElementById('email'),
    city: document.getElementById('city'),
    zip: document.getElementById('zip'),
    address: document.getElementById('address'),
    card: document.getElementById('card-number'),
    expiry: document.getElementById('expiry'),
    cvv: document.getElementById('cvv')
};

    let isValid = true;

    // Segédfüggvény a hiba megjelenítésére/elrejtésére
    function check(condition, element, errorId) {
    const errorSpan = document.getElementById(errorId);
    if (!condition) {
    element.classList.add('input-error');
    errorSpan.style.display = 'block';
    isValid = false;
} else {
    element.classList.remove('input-error');
    errorSpan.style.display = 'none';
}
}

    // Validációs szabályok
    check(fields.name.value.trim().length > 3, fields.name, 'error-name');
    check(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.value), fields.email, 'error-email');
    check(fields.city.value.trim() !== "", fields.city, 'error-city');
    check(/^\d{4}$/.test(fields.zip.value), fields.zip, 'error-zip');
    check(fields.address.value.trim().length > 5, fields.address, 'error-address');
    check(/^\d{16}$/.test(fields.card.value.replace(/\s/g, '')), fields.card, 'error-card');
    check(/^(0[1-9]|1[0-2])\/\d{2}$/.test(fields.expiry.value), fields.expiry, 'error-expiry');
    check(/^\d{3}$/.test(fields.cvv.value), fields.cvv, 'error-cvv');

    if (isValid) {
    // Form eltüntetése, siker üzenet mutatása
    document.getElementById('payment-form').style.display = 'none';
    const successBox = document.getElementById('success-message');
    successBox.style.display = 'block';

    console.log("Sikeres fizetés adatai:", {
    nev: fields.name.value,
    cim: `${fields.zip.value} ${fields.city.value}, ${fields.address.value}`
});
}
});

    // Automatikus kártya lejárat formázás (MM/YY)
    document.getElementById('expiry').addEventListener('input', function(e) {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length >= 2) e.target.value = v.substring(0,2) + '/' + v.substring(2,4);
});



        document.getElementById('payment-form').addEventListener('submit', function(e) {
        e.preventDefault();

        // Mezők
        const fields = {
        name: document.getElementById('full-name'),
        email: document.getElementById('email'),
        city: document.getElementById('city'),
        zip: document.getElementById('zip'),
        address: document.getElementById('address'),
        card: document.getElementById('card-number'),
        expiry: document.getElementById('expiry'),
        cvv: document.getElementById('cvv')
    };

        let isValid = true;

        // Segédfüggvény a hiba megjelenítésére/elrejtésére
        function check(condition, element, errorId) {
        const errorSpan = document.getElementById(errorId);
        if (!condition) {
        element.classList.add('input-error');
        errorSpan.style.display = 'block';
        isValid = false;
    } else {
        element.classList.remove('input-error');
        errorSpan.style.display = 'none';
    }
    }

        // Validációs szabályok
        check(fields.name.value.trim().length > 3, fields.name, 'error-name');
        check(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.value), fields.email, 'error-email');
        check(fields.city.value.trim() !== "", fields.city, 'error-city');
        check(/^\d{4}$/.test(fields.zip.value), fields.zip, 'error-zip');
        check(fields.address.value.trim().length > 5, fields.address, 'error-address');
        check(/^\d{16}$/.test(fields.card.value.replace(/\s/g, '')), fields.card, 'error-card');
        check(/^(0[1-9]|1[0-2])\/\d{2}$/.test(fields.expiry.value), fields.expiry, 'error-expiry');
        check(/^\d{3}$/.test(fields.cvv.value), fields.cvv, 'error-cvv');

        if (isValid) {
        // Form eltüntetése, siker üzenet mutatása
        document.getElementById('payment-form').style.display = 'none';
        const successBox = document.getElementById('success-message');
        successBox.style.display = 'block';

        console.log("Sikeres fizetés adatai:", {
        nev: fields.name.value,
        cim: `${fields.zip.value} ${fields.city.value}, ${fields.address.value}`
    });
    }
    });

        // Automatikus kártya lejárat formázás (MM/YY)
        document.getElementById('expiry').addEventListener('input', function(e) {
        let v = e.target.value.replace(/\D/g, '');
        if (v.length >= 2) e.target.value = v.substring(0,2) + '/' + v.substring(2,4);
    });
