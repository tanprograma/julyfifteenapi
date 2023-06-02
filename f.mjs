const ar = [{ num: 1 }, { num: 2 }, { num: 3 }, { num: 4 }];
const arr = [...ar].map((i) => {
  let { num } = i;
  num = 2 * num;
  return { num };
});
console.log(ar, arr);
