import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

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

const Index = () => {
  const { toast } = useToast();
  
  const [products, setProducts] = useState<Product[]>([
    { id: 1, name: 'Смартфон Samsung Galaxy S23', category: 'Электроника', stock: 45, price: 65000, supplier: 'Tech Supplier', minStock: 10 },
    { id: 2, name: 'Ноутбук ASUS ROG', category: 'Электроника', stock: 8, price: 120000, supplier: 'Tech Supplier', minStock: 5 },
    { id: 3, name: 'Наушники Sony WH-1000XM5', category: 'Аксессуары', stock: 23, price: 28000, supplier: 'Audio Store', minStock: 15 },
    { id: 4, name: 'Кофеварка DeLonghi', category: 'Бытовая техника', stock: 12, price: 35000, supplier: 'Home Goods', minStock: 8 },
    { id: 5, name: 'Умные часы Apple Watch', category: 'Электроника', stock: 3, price: 45000, supplier: 'Tech Supplier', minStock: 10 },
  ]);

  const [sales, setSales] = useState<Sale[]>([
    { id: 1, productName: 'Смартфон Samsung Galaxy S23', quantity: 2, price: 65000, discount: 5, total: 123500, date: '2024-01-10' },
    { id: 2, productName: 'Наушники Sony WH-1000XM5', quantity: 1, price: 28000, discount: 0, total: 28000, date: '2024-01-10' },
    { id: 3, productName: 'Ноутбук ASUS ROG', quantity: 1, price: 120000, discount: 10, total: 108000, date: '2024-01-09' },
  ]);

  const [purchases, setPurchases] = useState<Purchase[]>([
    { id: 1, productName: 'Смартфон Samsung Galaxy S23', supplier: 'Tech Supplier', quantity: 50, costPrice: 55000, total: 2750000, date: '2024-01-05', status: 'received' },
    { id: 2, productName: 'Умные часы Apple Watch', supplier: 'Tech Supplier', quantity: 20, costPrice: 38000, total: 760000, date: '2024-01-08', status: 'pending' },
  ]);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newSale, setNewSale] = useState({ productId: '', quantity: 1, discount: 0 });

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalProducts = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStockCount = products.filter(p => p.stock < p.minStock).length;
  const avgDiscount = sales.length > 0 ? sales.reduce((sum, s) => sum + s.discount, 0) / sales.length : 0;

  const topProducts = [...products]
    .sort((a, b) => b.price * b.stock - a.price * a.stock)
    .slice(0, 3);

  const handleNewSale = () => {
    const product = products.find(p => p.id === Number(newSale.productId));
    if (!product) {
      toast({ title: 'Ошибка', description: 'Выберите товар', variant: 'destructive' });
      return;
    }
    if (product.stock < newSale.quantity) {
      toast({ title: 'Ошибка', description: 'Недостаточно товара на складе', variant: 'destructive' });
      return;
    }

    const subtotal = product.price * newSale.quantity;
    const discountAmount = (subtotal * newSale.discount) / 100;
    const total = subtotal - discountAmount;

    const sale: Sale = {
      id: sales.length + 1,
      productName: product.name,
      quantity: newSale.quantity,
      price: product.price,
      discount: newSale.discount,
      total,
      date: new Date().toISOString().split('T')[0],
    };

    setSales([sale, ...sales]);
    setProducts(products.map(p => 
      p.id === product.id ? { ...p, stock: p.stock - newSale.quantity } : p
    ));

    toast({ title: 'Успешно!', description: `Продажа оформлена на сумму ${total.toLocaleString()} ₽` });
    setNewSale({ productId: '', quantity: 1, discount: 0 });
  };

  const getStockStatus = (product: Product) => {
    if (product.stock === 0) return { color: 'bg-red-500', text: 'Нет в наличии' };
    if (product.stock < product.minStock) return { color: 'bg-yellow-500', text: 'Мало' };
    return { color: 'bg-green-500', text: 'В наличии' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Система учета склада
            </h1>
            <p className="text-muted-foreground mt-1">Управление товарами и продажами</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-white hover:opacity-90 transition-opacity">
                <Icon name="Plus" className="mr-2" size={20} />
                Новая продажа
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Оформить продажу</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Товар</Label>
                  <Select value={newSale.productId} onValueChange={(val) => setNewSale({...newSale, productId: val})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите товар" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map(p => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {p.name} (В наличии: {p.stock})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Количество</Label>
                  <Input 
                    type="number" 
                    min="1" 
                    value={newSale.quantity}
                    onChange={(e) => setNewSale({...newSale, quantity: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <Label>Скидка (%)</Label>
                  <Input 
                    type="number" 
                    min="0" 
                    max="100"
                    value={newSale.discount}
                    onChange={(e) => setNewSale({...newSale, discount: Number(e.target.value)})}
                  />
                </div>
                <Button onClick={handleNewSale} className="w-full gradient-primary text-white">
                  Оформить продажу
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-none shadow-lg hover:shadow-xl transition-all hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Общая выручка</CardTitle>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                <Icon name="TrendingUp" className="text-white" size={20} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalRevenue.toLocaleString()} ₽</div>
              <p className="text-xs text-muted-foreground mt-1">+12.5% за месяц</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-all hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Товаров на складе</CardTitle>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center">
                <Icon name="Package" className="text-white" size={20} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalProducts}</div>
              <p className="text-xs text-muted-foreground mt-1">{products.length} наименований</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-all hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Мало товара</CardTitle>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                <Icon name="AlertTriangle" className="text-white" size={20} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{lowStockCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Требуется пополнение</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-all hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Средняя скидка</CardTitle>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <Icon name="Percent" className="text-white" size={20} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{avgDiscount.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground mt-1">По всем продажам</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="products" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid bg-white shadow-md">
            <TabsTrigger value="products" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
              <Icon name="Package" className="mr-2" size={16} />
              Товары
            </TabsTrigger>
            <TabsTrigger value="sales" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
              <Icon name="ShoppingCart" className="mr-2" size={16} />
              Продажи
            </TabsTrigger>
            <TabsTrigger value="purchases" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
              <Icon name="TrendingUp" className="mr-2" size={16} />
              Закупки
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
              <Icon name="BarChart3" className="mr-2" size={16} />
              Отчеты
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <CardTitle>Управление товарами</CardTitle>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все категории</SelectItem>
                      {categories.filter(c => c !== 'all').map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-semibold">Товар</th>
                        <th className="text-left p-3 font-semibold">Категория</th>
                        <th className="text-left p-3 font-semibold">Остаток</th>
                        <th className="text-left p-3 font-semibold">Цена</th>
                        <th className="text-left p-3 font-semibold">Поставщик</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => {
                        const status = getStockStatus(product);
                        return (
                          <tr key={product.id} className="border-b hover:bg-purple-50/50 transition-colors">
                            <td className="p-3 font-medium">{product.name}</td>
                            <td className="p-3">
                              <Badge variant="outline" className="bg-purple-50">{product.category}</Badge>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${status.color}`} />
                                <span className="font-semibold">{product.stock}</span>
                                <span className="text-xs text-muted-foreground">шт</span>
                              </div>
                            </td>
                            <td className="p-3 font-semibold">{product.price.toLocaleString()} ₽</td>
                            <td className="p-3 text-muted-foreground">{product.supplier}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sales" className="space-y-4">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>История продаж</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-semibold">Дата</th>
                        <th className="text-left p-3 font-semibold">Товар</th>
                        <th className="text-left p-3 font-semibold">Кол-во</th>
                        <th className="text-left p-3 font-semibold">Цена</th>
                        <th className="text-left p-3 font-semibold">Скидка</th>
                        <th className="text-left p-3 font-semibold">Сумма</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sales.map((sale) => (
                        <tr key={sale.id} className="border-b hover:bg-purple-50/50 transition-colors">
                          <td className="p-3 text-muted-foreground">{new Date(sale.date).toLocaleDateString()}</td>
                          <td className="p-3 font-medium">{sale.productName}</td>
                          <td className="p-3">{sale.quantity} шт</td>
                          <td className="p-3">{sale.price.toLocaleString()} ₽</td>
                          <td className="p-3">
                            {sale.discount > 0 && (
                              <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                                -{sale.discount}%
                              </Badge>
                            )}
                          </td>
                          <td className="p-3 font-bold text-green-600">{sale.total.toLocaleString()} ₽</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="purchases" className="space-y-4">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>Закупки и поступления</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-semibold">Дата</th>
                        <th className="text-left p-3 font-semibold">Товар</th>
                        <th className="text-left p-3 font-semibold">Поставщик</th>
                        <th className="text-left p-3 font-semibold">Кол-во</th>
                        <th className="text-left p-3 font-semibold">Себестоимость</th>
                        <th className="text-left p-3 font-semibold">Итого</th>
                        <th className="text-left p-3 font-semibold">Статус</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchases.map((purchase) => (
                        <tr key={purchase.id} className="border-b hover:bg-purple-50/50 transition-colors">
                          <td className="p-3 text-muted-foreground">{new Date(purchase.date).toLocaleDateString()}</td>
                          <td className="p-3 font-medium">{purchase.productName}</td>
                          <td className="p-3">{purchase.supplier}</td>
                          <td className="p-3">{purchase.quantity} шт</td>
                          <td className="p-3">{purchase.costPrice.toLocaleString()} ₽</td>
                          <td className="p-3 font-bold">{purchase.total.toLocaleString()} ₽</td>
                          <td className="p-3">
                            <Badge 
                              className={
                                purchase.status === 'received' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                                purchase.status === 'pending' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' :
                                'bg-red-100 text-red-700 hover:bg-red-100'
                              }
                            >
                              {purchase.status === 'received' ? 'Получено' : 
                               purchase.status === 'pending' ? 'В пути' : 'Отменено'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="TrendingUp" className="text-purple-600" />
                    Топ товаров по стоимости запаса
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topProducts.map((product, idx) => (
                      <div key={product.id} className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold">{product.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {product.stock} шт × {product.price.toLocaleString()} ₽
                          </div>
                        </div>
                        <div className="font-bold text-purple-600">
                          {(product.stock * product.price).toLocaleString()} ₽
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Download" className="text-blue-600" />
                    Экспорт отчетов
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start hover:bg-green-50 hover:border-green-300 transition-colors"
                      onClick={() => toast({ title: 'Excel экспорт', description: 'Функция в разработке' })}
                    >
                      <Icon name="FileSpreadsheet" className="mr-2 text-green-600" />
                      Экспорт в Excel
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start hover:bg-red-50 hover:border-red-300 transition-colors"
                      onClick={() => toast({ title: 'PDF экспорт', description: 'Функция в разработке' })}
                    >
                      <Icon name="FileText" className="mr-2 text-red-600" />
                      Экспорт в PDF
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start hover:bg-blue-50 hover:border-blue-300 transition-colors"
                      onClick={() => toast({ title: 'CSV экспорт', description: 'Функция в разработке' })}
                    >
                      <Icon name="Download" className="mr-2 text-blue-600" />
                      Экспорт в CSV
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="BarChart3" className="text-orange-600" />
                  Статистика по категориям
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categories.filter(c => c !== 'all').map(category => {
                    const categoryProducts = products.filter(p => p.category === category);
                    const totalValue = categoryProducts.reduce((sum, p) => sum + (p.stock * p.price), 0);
                    const totalStock = categoryProducts.reduce((sum, p) => sum + p.stock, 0);
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">{category}</span>
                          <span className="text-sm text-muted-foreground">
                            {categoryProducts.length} наименований, {totalStock} шт
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-3 bg-purple-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full gradient-primary rounded-full transition-all"
                              style={{ width: `${(totalValue / products.reduce((sum, p) => sum + (p.stock * p.price), 0)) * 100}%` }}
                            />
                          </div>
                          <span className="font-bold text-purple-600 min-w-[120px] text-right">
                            {totalValue.toLocaleString()} ₽
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
