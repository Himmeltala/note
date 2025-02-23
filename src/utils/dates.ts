export function formatDate(format: string, str?: string) {
  const date = str ? new Date(str) : new Date();
  const dates = {
    YY: String(date.getFullYear()),
    MM: String(date.getMonth() + 1).padStart(2, "0"),
    DD: String(date.getDate()).padStart(2, "0"),
    hh: String(date.getHours()).padStart(2, "0"),
    mm: String(date.getMinutes()).padStart(2, "0"),
    ss: String(date.getSeconds()).padStart(2, "0")
  };

  let formatted = format;

  for (const [key, value] of Object.entries(dates)) {
    formatted = formatted.replace(key, value);
  }

  return formatted;
}

export function nowDate(format: string, val?: Date) {
  const date = val || new Date();

  const components = {
    YY: String(date.getFullYear()).padStart(2, "0"),
    MM: String(date.getMonth() + 1).padStart(2, "0"),
    DD: String(date.getDate()).padStart(2, "0"),
    hh: String(date.getHours()).padStart(2, "0"),
    mm: String(date.getMinutes()).padStart(2, "0"),
    ss: String(date.getSeconds()).padStart(2, "0")
  };

  let formated = format;
  for (const [key, value] of Object.entries(components)) {
    if (typeof value === "string") {
      formated = formated.replace(key, value);
    }
  }

  return new Date(formated);
}
