const products = [
  {id:"aura-long-sleeve",name:"Aura Defined Long Sleeve",brand:"Aura Defined",category:"Long Sleeves",price:250,tag:"New",image:"aura-tee-back-model.jpg",description:"Black long sleeve carrying the blackletter Aura Defined mark across the back. Part of the Aura Unfiltered campaign."},
  {id:"aura-short-sleeve",name:"Aura Defined Short Sleeve",brand:"Aura Defined",category:"T-Shirts",price:200,tag:"New",image:"aura-beige-tee-detail.jpg",description:"Sand short sleeve tee with the Aura Defined emblem and wordmark on the chest and a hidden emblem inside the collar."},
  {id:"stand-firm-tee",name:"Stand Firm Tee",brand:"Young Christian Worldwide",category:"T-Shirts",price:250,tag:"Stand Firm Campaign",image:"yc-sf-white-back.jpg",colors:{White:["yc-sf-white-back.jpg","yc-sf-white-back-shop.jpg","yc-sf-white-front.jpg"],Grey:["yc-sf-grey-flat.jpg","yc-sf-table.jpg","yc-sleeve-print.jpg"]},description:"Ephesians 6:13 in bold type on the back, with the Young Christian Worldwide mark on the front. The Stand Firm campaign piece, in white or grey."}
];
const whatsapp = "260966149589";
const nestedPage = document.querySelector("base") !== null;
const pagePrefix = nestedPage ? "" : "pages/";
const imagePrefix = nestedPage ? "../images/" : "images/";
const pageUrl = name => `${pagePrefix}${name}`;
const readCart = () => {
  try {
    const value = JSON.parse(localStorage.getItem("yc") || "[]");
    return Array.isArray(value) ? value : [];
  } catch (error) {
    console.error("Could not read the saved cart.", error);
    return [];
  }
};
const saveCart = cart => {
  localStorage.setItem("yc", JSON.stringify(cart));
  document.querySelectorAll("[data-cart-count]").forEach(el => {
    el.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
  });
};
const productCard = product => `<article class="product-card" data-category="${product.category}" data-name="${product.name.toLowerCase()}">
  <a class="product-photo" href="${pageUrl(`product.html?id=${encodeURIComponent(product.id)}`)}"><img src="${imagePrefix}${product.image}" alt="${product.name}" loading="lazy">${product.tag ? `<span class="tag">${product.tag}</span>` : ""}</a>
  <span class="brand-label">${product.brand}</span><h3>${product.name}</h3><p>K${product.price} <span class="muted">· Available to order</span></p>
  <a class="button outline" href="${pageUrl(`product.html?id=${encodeURIComponent(product.id)}`)}">View product</a>
</article>`;
const productTarget = document.querySelector("[data-products]");
if (productTarget) productTarget.innerHTML = products.map(productCard).join("");
document.querySelectorAll("[data-cart-count]").forEach(el => {
  el.textContent = readCart().reduce((sum, item) => sum + item.quantity, 0);
});

const shopGrid = document.querySelector("[data-shop-grid]");
if (shopGrid) {
  const search = document.querySelector("[data-search]");
  let selectedCategory = "All";
  const filter = () => {
    const query = search.value.trim().toLowerCase();
    const matching = products.filter(product =>
      (selectedCategory === "All" || product.category === selectedCategory ||
        (selectedCategory === "New Arrivals" && product.tag === "New")) &&
      product.name.toLowerCase().includes(query)
    );
    shopGrid.innerHTML = matching.length ? matching.map(productCard).join("") : '<p class="muted">Nothing here yet.</p>';
  };
  document.querySelector("[data-filters]").addEventListener("click", event => {
    const button = event.target.closest("[data-category-filter]");
    if (!button) return;
    selectedCategory = button.dataset.categoryFilter;
    document.querySelectorAll("[data-category-filter]").forEach(item => item.classList.toggle("active", item === button));
    filter();
  });
  search.addEventListener("input", filter);
  filter();
}

const detail = document.querySelector("[data-product-detail]");
if (detail) {
  const product = products.find(item => item.id === new URLSearchParams(location.search).get("id"));
  if (!product) {
    detail.innerHTML = `<h1>Product not found</h1><p><a href="${pageUrl("shop.html")}">Return to the shop</a></p>`;
  } else {
    document.title = `${product.name} | YC EXCLUSIVE`;
    detail.innerHTML = `<img data-product-image src="${imagePrefix}${product.image}" alt="${product.name}">
      <div><span class="eyebrow">${product.brand}</span><h1>${product.name}</h1><p><strong>K${product.price}</strong></p><p class="muted">${product.description}</p>
      ${product.colors ? `<label for="color">Colour</label><select id="color">${Object.keys(product.colors).map(color => `<option>${color}</option>`).join("")}</select>` : ""}
      <label for="size">Size</label><select id="size"><option value="">Choose a size</option>${["S","M","L","XL","XXL"].map(size => `<option>${size}</option>`).join("")}</select>
      <button class="button" type="button" data-add-to-cart>Add to cart</button><a class="button outline" href="${pageUrl("shop.html")}">Continue shopping</a></div>`;
    if (product.colors) {
      detail.querySelector("#color").addEventListener("change", event => {
        detail.querySelector("[data-product-image]").src = `${imagePrefix}${product.colors[event.target.value][0]}`;
      });
    }
    detail.querySelector("[data-add-to-cart]").addEventListener("click", () => {
      const size = detail.querySelector("#size").value;
      if (!size) { detail.querySelector("#size").focus(); return; }
      const color = product.colors ? detail.querySelector("#color").value : "";
      const cart = readCart();
      const line = cart.find(item => item.id === product.id && item.size === size && item.color === color);
      if (line) line.quantity += 1;
      else cart.push({id:product.id,size,quantity:1,color});
      saveCart(cart);
      location.href = "cart.html";
    });
  }
}

const cartTarget = document.querySelector("[data-cart-items]");
if (cartTarget) {
  const cart = readCart();
  const rows = cart.map((item, index) => {
    const product = products.find(entry => entry.id === item.id);
    const image = product && product.colors && item.color ? product.colors[item.color][0] : product && product.image;
    return product ? `<article class="cart-row"><img src="${imagePrefix}${image}" alt="${product.name}"><div><strong>${product.name}</strong><p class="muted">${item.color ? `${item.color} · ` : ""}Size ${item.size} · Qty ${item.quantity}</p></div><div>K${product.price * item.quantity}<br><button type="button" data-remove="${index}">Remove</button></div></article>` : "";
  }).filter(Boolean);
  const total = cart.reduce((sum, item) => {
    const product = products.find(entry => entry.id === item.id);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);
  cartTarget.innerHTML = rows.length ? `${rows.join("")}<p class="cart-total">Subtotal <strong>K${total}</strong></p><a class="button" href="${pageUrl("checkout.html")}">Checkout</a>` : `<p class="empty muted">Your cart is empty.</p><a class="button" href="${pageUrl("shop.html")}">Shop</a>`;
  cartTarget.addEventListener("click", event => {
    const button = event.target.closest("[data-remove]");
    if (!button) return;
    const updated = readCart();
    updated.splice(Number(button.dataset.remove), 1);
    saveCart(updated);
    location.reload();
  });
}

const checkout = document.querySelector("[data-checkout]");
if (checkout) {
  const handoff = document.querySelector("[data-order-handoff]");
  checkout.addEventListener("submit", event => {
    event.preventDefault();
    const cart = readCart();
    if (!cart.length) { location.href = "cart.html"; return; }
    const form = new FormData(checkout);
    const lines = cart.map(item => {
      const product = products.find(entry => entry.id === item.id);
      return product ? `- ${product.name}${item.color ? ` (${item.color})` : ""} (size ${item.size}) x${item.quantity} = K${product.price * item.quantity}` : "";
    }).filter(Boolean);
    const subtotal = cart.reduce((sum, item) => {
      const product = products.find(entry => entry.id === item.id);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);
    const message = `New YC EXCLUSIVE order\n${lines.join("\n")}\nSubtotal: K${subtotal}\nDelivery: ${form.get("delivery")}\nAddress: ${form.get("address")}\nName: ${form.get("name")}\nPhone: ${form.get("phone")}`;
    const whatsappLink = document.querySelector("[data-whatsapp-order]");
    whatsappLink.href = `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;
    document.querySelector("[data-order-message]").value = message;
    checkout.hidden = true;
    handoff.hidden = false;
    handoff.querySelector("[data-confirm-sent]").addEventListener("click", () => {
      saveCart([]);
      location.href = "thank-you.html";
    }, {once:true});
  });
}
