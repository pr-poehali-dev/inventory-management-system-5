import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Product {
  id: number;
  name: string;
  category: string;
  stock: number;
  price: number;
  supplier: string;
  minStock: number;
}

interface Sale {
  id: number;
  productName: string;
  quantity: number;
  price: number;
  discount: number;
  total: number;
  date: string;
}

interface Purchase {
  id: number;
  productName: string;
  supplier: string;
  quantity: number;
  costPrice: number;
  total: number;
  date: string;
  status: 'pending' | 'received' | 'cancelled';
}

export const exportToExcel = (products: Product[], sales: Sale[], purchases: Purchase[]) => {
  const wb = XLSX.utils.book_new();

  const productsData = products.map(p => ({
    'Товар': p.name,
    'Категория': p.category,
    'Остаток': p.stock,
    'Цена': p.price,
    'Поставщик': p.supplier,
    'Мин. запас': p.minStock,
    'Статус': p.stock < p.minStock ? 'Требуется пополнение' : 'В наличии'
  }));

  const salesData = sales.map(s => ({
    'Дата': new Date(s.date).toLocaleDateString(),
    'Товар': s.productName,
    'Количество': s.quantity,
    'Цена': s.price,
    'Скидка %': s.discount,
    'Сумма': s.total
  }));

  const purchasesData = purchases.map(p => ({
    'Дата': new Date(p.date).toLocaleDateString(),
    'Товар': p.productName,
    'Поставщик': p.supplier,
    'Количество': p.quantity,
    'Себестоимость': p.costPrice,
    'Итого': p.total,
    'Статус': p.status === 'received' ? 'Получено' : p.status === 'pending' ? 'В пути' : 'Отменено'
  }));

  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const totalProducts = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStockCount = products.filter(p => p.stock < p.minStock).length;

  const summaryData = [
    { 'Показатель': 'Общая выручка', 'Значение': `${totalRevenue.toLocaleString()} ₽` },
    { 'Показатель': 'Товаров на складе', 'Значение': totalProducts },
    { 'Показатель': 'Наименований', 'Значение': products.length },
    { 'Показатель': 'Требуется пополнение', 'Значение': lowStockCount },
    { 'Показатель': 'Продаж', 'Значение': sales.length },
  ];

  const wsProducts = XLSX.utils.json_to_sheet(productsData);
  const wsSales = XLSX.utils.json_to_sheet(salesData);
  const wsPurchases = XLSX.utils.json_to_sheet(purchasesData);
  const wsSummary = XLSX.utils.json_to_sheet(summaryData);

  XLSX.utils.book_append_sheet(wb, wsSummary, 'Сводка');
  XLSX.utils.book_append_sheet(wb, wsProducts, 'Товары');
  XLSX.utils.book_append_sheet(wb, wsSales, 'Продажи');
  XLSX.utils.book_append_sheet(wb, wsPurchases, 'Закупки');

  XLSX.writeFile(wb, `Отчет_склад_${new Date().toLocaleDateString()}.xlsx`);
};

export const exportToPDF = (products: Product[], sales: Sale[], purchases: Purchase[]) => {
  const doc = new jsPDF();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('Отчет по складу', 14, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Дата формирования: ${new Date().toLocaleDateString()}`, 14, 28);

  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const totalProducts = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStockCount = products.filter(p => p.stock < p.minStock).length;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Сводная информация', 14, 38);

  const summaryData = [
    ['Общая выручка', `${totalRevenue.toLocaleString()} ₽`],
    ['Товаров на складе', totalProducts.toString()],
    ['Наименований', products.length.toString()],
    ['Требуется пополнение', lowStockCount.toString()],
    ['Всего продаж', sales.length.toString()],
  ];

  autoTable(doc, {
    startY: 42,
    head: [['Показатель', 'Значение']],
    body: summaryData,
    theme: 'grid',
    headStyles: { fillColor: [139, 92, 246] },
    margin: { left: 14 },
  });

  const finalY1 = (doc as any).lastAutoTable.finalY || 42;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Товары на складе', 14, finalY1 + 10);

  const productsData = products.map(p => [
    p.name,
    p.category,
    p.stock.toString(),
    `${p.price.toLocaleString()} ₽`,
    p.stock < p.minStock ? 'Мало' : 'В наличии'
  ]);

  autoTable(doc, {
    startY: finalY1 + 14,
    head: [['Товар', 'Категория', 'Остаток', 'Цена', 'Статус']],
    body: productsData,
    theme: 'striped',
    headStyles: { fillColor: [217, 70, 239] },
    margin: { left: 14 },
  });

  doc.addPage();

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('История продаж', 14, 20);

  const salesData = sales.map(s => [
    new Date(s.date).toLocaleDateString(),
    s.productName,
    s.quantity.toString(),
    `${s.price.toLocaleString()} ₽`,
    `${s.discount}%`,
    `${s.total.toLocaleString()} ₽`
  ]);

  autoTable(doc, {
    startY: 24,
    head: [['Дата', 'Товар', 'Кол-во', 'Цена', 'Скидка', 'Сумма']],
    body: salesData,
    theme: 'striped',
    headStyles: { fillColor: [139, 92, 246] },
    margin: { left: 14 },
  });

  const finalY2 = (doc as any).lastAutoTable.finalY || 24;

  if (finalY2 > 250) {
    doc.addPage();
    doc.text('Закупки и поступления', 14, 20);
    autoTable(doc, {
      startY: 24,
      head: [['Дата', 'Товар', 'Поставщик', 'Кол-во', 'Себестоимость', 'Итого', 'Статус']],
      body: purchases.map(p => [
        new Date(p.date).toLocaleDateString(),
        p.productName,
        p.supplier,
        p.quantity.toString(),
        `${p.costPrice.toLocaleString()} ₽`,
        `${p.total.toLocaleString()} ₽`,
        p.status === 'received' ? 'Получено' : p.status === 'pending' ? 'В пути' : 'Отменено'
      ]),
      theme: 'striped',
      headStyles: { fillColor: [249, 115, 22] },
      margin: { left: 14 },
    });
  } else {
    doc.text('Закупки и поступления', 14, finalY2 + 10);
    autoTable(doc, {
      startY: finalY2 + 14,
      head: [['Дата', 'Товар', 'Поставщик', 'Кол-во', 'Себестоимость', 'Итого', 'Статус']],
      body: purchases.map(p => [
        new Date(p.date).toLocaleDateString(),
        p.productName,
        p.supplier,
        p.quantity.toString(),
        `${p.costPrice.toLocaleString()} ₽`,
        `${p.total.toLocaleString()} ₽`,
        p.status === 'received' ? 'Получено' : p.status === 'pending' ? 'В пути' : 'Отменено'
      ]),
      theme: 'striped',
      headStyles: { fillColor: [249, 115, 22] },
      margin: { left: 14 },
    });
  }

  doc.save(`Отчет_склад_${new Date().toLocaleDateString()}.pdf`);
};

export const exportToCSV = (products: Product[], sales: Sale[], purchases: Purchase[]) => {
  const wb = XLSX.utils.book_new();

  const combinedData = [
    ['ТОВАРЫ НА СКЛАДЕ'],
    ['Товар', 'Категория', 'Остаток', 'Цена', 'Поставщик', 'Мин. запас'],
    ...products.map(p => [p.name, p.category, p.stock, p.price, p.supplier, p.minStock]),
    [],
    ['ПРОДАЖИ'],
    ['Дата', 'Товар', 'Количество', 'Цена', 'Скидка %', 'Сумма'],
    ...sales.map(s => [new Date(s.date).toLocaleDateString(), s.productName, s.quantity, s.price, s.discount, s.total]),
    [],
    ['ЗАКУПКИ'],
    ['Дата', 'Товар', 'Поставщик', 'Количество', 'Себестоимость', 'Итого', 'Статус'],
    ...purchases.map(p => [
      new Date(p.date).toLocaleDateString(), 
      p.productName, 
      p.supplier, 
      p.quantity, 
      p.costPrice, 
      p.total, 
      p.status === 'received' ? 'Получено' : p.status === 'pending' ? 'В пути' : 'Отменено'
    ]),
  ];

  const ws = XLSX.utils.aoa_to_sheet(combinedData);
  XLSX.utils.book_append_sheet(wb, ws, 'Отчет');

  XLSX.writeFile(wb, `Отчет_склад_${new Date().toLocaleDateString()}.csv`);
};
