const form = document.querySelector("#ticket-form");
const list = document.querySelector("#ticket-list");
const status = document.querySelector("#status");
const summary = document.querySelector("#summary");
const refreshButton = document.querySelector("#refresh-button");
const sendButton = document.querySelector("#send-button");
function setStatus(text, kind = "info") {
  status.textContent = text;
  status.dataset.kind = kind;
}
function renderTickets(items) {
  list.replaceChildren();
  if (!items.length) {
    const empty = document.createElement("div"); 
    empty.className = "empty";
    empty.textContent = "Пока обращений нет";
    list.append(empty);
    return;
  }
  for (const ticket of items){
    const article = document.createElement("h3");
    article.className = "item";
    const h3 = document.createElement("h3");
    h3.textContent = `#${ticket.id}  ${ticket.customer}`;
    const p = document.createElement("p");
    p.textContent = ticket.problem;
    const meta = document.createElement("div");
    meta.className = "meta";
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = ticket.status;
    meta.append(chip);
    article.append(h3, meta, p);
    list.append(article);
  }
}
async function loadTickets() {
 setStatus("Загружаем обращения...", "loading");
 try {
  const response = await fetch("/api/tickets");
  if (!response.ok) throw new Error(`GET: HTTP ${response.status}`);
  const data = await response.json();
  if (!Array.isArray(data.items))
    throw new Error("Сервер вернул неверный формат списка");
  renderTickets(data.items);
  summary.textContent = `Всего обращений : ${data.total}`;
  setStatus("Список обновлён", "success");
 } catch (error) {
  setStatus (`Не удалось загрузить сптсок: ${error.message}`, "error");
 }
}
async function createTicket(payload) {
  const response = await fetch("/api/tickets",{
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload), 
  });
const data = await response.json();
if (!response.ok)
  throw new Error(data.error || `POST: HTTP ${response.status}`);
return data;
}
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const customer = form.elements.customer.value.trim();
  const problem = form.elements.problem.value.trim();
  if (customer.length < 2 || problem.length < 5 ) {
    setStatus("Заполните имя и описания проблемы", "error");
    return;
  }
  sendButton.disabled = true;
  setStatus("Отправляем новую заявку...", "loading");
  try {
    const result = await createTicket({ customer, problem });
    form.reset();
    await loadTickets();
    setStatus(`${result.message}: #${result.item.id}`, "success");
  } catch (error) {
    setStatus(`Отправка не выполненаЖ ${error.message}`, "error");
  }finally { 
    sendButton.disabled = false;
  }
});
refreshButton.addEventListener("click", loadTickets);
loadTickets();
