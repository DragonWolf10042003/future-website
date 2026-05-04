function convertImageToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
let woodType = null;

if (window.location.pathname.includes("contentonwood.html")) {
    const params = new URLSearchParams(window.location.search);
    woodType = params.get("wood");

    if (!woodType) {
        window.location.href = "woodselection.html";
    }

    const woodNameHeading = document.getElementById("woodName");
    const woodImage = document.getElementById("woodImage");

    const woodImages = {
        Bamboo: "images/bamboo.jpg",
        Basswood: "images/basswood.jpg",
        Pinewood: "images/pinewood.jpg",
        Rosewood: "images/rosewood.jpg",
        Walnut: "images/walnut.jpg"
    };

    woodNameHeading.textContent = woodType;
    woodImage.src = woodImages[woodType];
    woodImage.alt = woodType + " wood";
}

function getSelectedItemType() {
    const radios = document.querySelectorAll('input[name="item"]');
    for (const radio of radios) {
        if (radio.checked) return radio.value;
    }
    return null;
}

function addToCart(item) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push(item);
    localStorage.setItem("cart", JSON.stringify(cart));
}

document.addEventListener("DOMContentLoaded", () => {
    const addToCartBtn = document.getElementById("addToCartBtn");
   if (addToCartBtn) {
    addToCartBtn.addEventListener("click", async () => {
        const itemType = getSelectedItemType();
        const engraveText = document.getElementById("engraveText").value.trim();
        const quantity = parseInt(document.getElementById("quantity").value, 12);
        const photoInput = document.getElementById("engravePhoto");
        const photoFile = photoInput.files[0];

        if (!itemType) {
            alert("Please select an item type.");
            return;
        }

        if (!engraveText) {
            alert("Please enter text to engrave.");
            return;
        }

        let photoBase64 = null;
        if (photoFile) {
            photoBase64 = await convertImageToBase64(photoFile);
        }

        const pricePerItem = 12;
        const totalPrice = pricePerItem * quantity;

        const item = {
            woodType,
            itemType,
            engraveText,
            quantity,
            pricePerItem,
            totalPrice,
            photoBase64
        };

        addToCart(item);
        window.location.href = "cart.html";
    });
}

    const checkoutBtn = document.getElementById("checkoutBtn");
    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", () => {
            window.location.href = "checkout.html";
        });
    }

    const placeOrderBtn = document.getElementById("placeOrderBtn");
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener("click", () => {
            const fullname = document.getElementById("fullname").value.trim();
            const address1 = document.getElementById("address1").value.trim();
            const address2 = document.getElementById("address2").value.trim();
            const city = document.getElementById("city").value.trim();
            const state = document.getElementById("state").value.trim();
            const zip = document.getElementById("zip").value.trim();

            if (!fullname || !address1 || !city || !state || !zip) {
                alert("Please fill out all required fields.");
                return;
            }

            let cart = JSON.parse(localStorage.getItem("cart")) || [];
            if (cart.length === 0) {
                alert("Your cart is empty.");
                return;
            }

            let subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
            let shipping = 5.00;
            let grandTotal = subtotal + shipping;

            const order = {
                customer: { fullname, address1, address2, city, state, zip },
                items: cart,
                totals: { subtotal, shipping, grandTotal },
                timestamp: new Date().toLocaleString()
            };

            fetch("https://script.google.com/macros/s/AKfycbylgRlcnLGASYgYN4GPppTDa6q4bhRI3vdmsZW0_NzgzqPjV72trc9uWlzjAM_suj0T/exec", {
                method: "POST",
                body: JSON.stringify(order),
                headers: { "Content-Type": "text/plain;charset=utf-8" }
            })
            .then(res => res.text())
            .then(() => {
                localStorage.removeItem("cart");
                alert("Order placed successfully!");
                window.location.href = "index.html";
            })
            .catch(() => {
                alert("There was an error placing your order.");
            });
        });
    }

    loadOrderSummary();
    loadCart();
});

function loadCart() {
    const cartContainer = document.getElementById("cartItems");
    if (!cartContainer) return;

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (cart.length === 0) {
        cartContainer.innerHTML = "<p>Your cart is empty.</p>";
        return;
    }

cart.forEach((item, index) => {
    cartContainer.innerHTML += `
        <div class="cart-item">
            <p><strong>${item.itemType}</strong> (${item.woodType})</p>
            <p>Engraving: ${item.engraveText}</p>

            ${item.photoBase64 ? `<img src="${item.photoBase64}" style="width:120px;height:auto;margin:10px 0;">` : ""}

            <p>Quantity: ${item.quantity}</p>
            <p>Price per item: $${item.pricePerItem.toFixed(2)}</p>
            <p><strong>Total: $${item.totalPrice.toFixed(2)}</strong></p>
            <button onclick="removeItem(${index})">Remove</button>
            <hr>
        </div>
    `;
});
    updateTotals();
}

function updateTotals() {
    const totalsContainer = document.getElementById("cartTotals");
    if (!totalsContainer) return;

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
    const shipping = 5.00;

    totalsContainer.innerHTML = `
        <p>Subtotal: $${subtotal.toFixed(2)}</p>
        <p>Shipping: $${shipping.toFixed(2)}</p>
        <p><strong>Grand Total: $${(subtotal + shipping).toFixed(2)}</strong></p>
    `;
}

function removeItem(index) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    loadCart();
}

function loadOrderSummary() {
    const summaryContainer = document.getElementById("orderSummary");
    if (!summaryContainer) return;

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (cart.length === 0) {
        summaryContainer.innerHTML = "<p>Your cart is empty.</p>";
        return;
    }

    let html = "<h2>Order Summary</h2>";

    cart.forEach(item => {
       html += `
    <div class="summary-item">
        <p><strong>${item.itemType}</strong> (${item.woodType})</p>
        <p>Engraving: ${item.engraveText}</p>

        ${item.photoBase64 ? `<img src="${item.photoBase64}" style="width:120px;height:auto;margin:10px 0;">` : ""}

        <p>Quantity: ${item.quantity}</p>
        <p>Total: $${item.totalPrice.toFixed(2)}</p>
        <hr>
    </div>
`;
    });

    let subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
    let shipping = 5.00;

    html += `
        <p><strong>Subtotal:</strong> $${subtotal.toFixed(2)}</p>
        <p><strong>Shipping:</strong> $${shipping.toFixed(2)}</p>
        <p><strong>Grand Total:</strong> $${(subtotal + shipping).toFixed(2)}</p>
    `;

    summaryContainer.innerHTML = html;
}