document.addEventListener("DOMContentLoaded", async () => {
  const [stores] = await Promise.all([getStore()]);
  console.log(stores);
  setSelection(stores);
  //   setTable(stock);
  setZindex(0);
  const button = document.querySelector("button");
  button.addEventListener("click", async function (e) {
    e.preventDefault();
    const value = document.querySelector("select").value;
    setZindex(1);
    const stock = await getStock(value);
    setTable(stock);
    setZindex(0);
  });
});
const url = window.location.origin;
function setSelection(data) {
  const selection = document.querySelector("select");
  const op = document.createElement("option");
  op.value = "";
  op.innerText = "select store";
  op.disabled = true;
  selection.append(op);
  data.forEach((d) => {
    const option = document.createElement("option");
    option.value = d.name;
    option.innerText = d.name;
    selection.append(option);
  });
}
function setTable(data) {
  const tbody = document.querySelector("tbody");
  data.forEach((d, index) => {
    const tr = createTr(d, index);
    tbody.append(tr);
  });
}
function createTr(data, index) {
  const tr = document.createElement("tr");

  const sn = document.createElement("td");
  sn.innerText = index + 1;
  const item = document.createElement("td");
  item.innerText = data.commodity;
  const beginning = document.createElement("td");
  beginning.innerText = data.beginning;
  const stock = document.createElement("td");

  stock.innerText = data.stock;
  tr.append(sn);
  tr.append(item);
  tr.append(beginning);
  tr.append(stock);
  return tr;
}
async function getStore() {
  const res = await fetch(`${url}/api/stores`);
  const data = await res.json();
  return data;
}
function getValue(id) {
  const value = document.querySelector(id).value;
}

// async function getStore() {
//   console.log("start fetching");
//   const res = await fetch(`https://julyfifteenapi.onrender.com/api/stores`);
//   const data = await res.json();

//   console.log("returning data");
//   console.log(window.location.origin);
//   return data;
// }
function setZindex(n) {
  const item = document.querySelector(".loading");
  if (item) {
    item.style["z-index"] = n;
  }
}
async function getStock(store) {
  console.log("starting the process");
  const res = await fetch(`${url}/api/inventories/beginnings/refill/${store}`);
  console.log("returning data");
  const data = await res.json();
  return data;
}
