const list = ["kija", "kija", "kija", 3, 5, "kija"];
for (let i = 0; i < list.length; i++) {
  cons(list[i]);
}
function cons(item) {
  if (!item.length) {
    return;
  }
  console.log(item);
}
