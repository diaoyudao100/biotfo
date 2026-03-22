-- 种子数据：分类、品牌、商品、SKU

-- 分类
INSERT OR IGNORE INTO categories (name, slug, icon, sort_order) VALUES ('服饰', 'clothing', '👕', 1);
INSERT OR IGNORE INTO categories (name, slug, icon, sort_order, parent_id) VALUES ('上装', 'tops', '👔', 1, 1);
INSERT OR IGNORE INTO categories (name, slug, icon, sort_order, parent_id) VALUES ('下装', 'bottoms', '👖', 2, 1);
INSERT OR IGNORE INTO categories (name, slug, icon, sort_order) VALUES ('鞋靴', 'shoes', '👟', 2);
INSERT OR IGNORE INTO categories (name, slug, icon, sort_order) VALUES ('配饰', 'accessories', '⌚', 3);
INSERT OR IGNORE INTO categories (name, slug, icon, sort_order) VALUES ('箱包', 'bags', '👜', 4);

-- 品牌
INSERT OR IGNORE INTO brands (name, slug, description) VALUES ('BRAND STORE', 'brand-store', '我们的自有品牌，追求品质与设计的完美平衡');

-- 商品 1
INSERT OR IGNORE INTO products (category_id, brand_id, name, slug, subtitle, description, main_image, status, is_featured, price_min, price_max, sales_count)
VALUES (2, 1, '经典圆领T恤', 'classic-crew-tee', '100%纯棉，舒适透气', '<h2>经典圆领T恤</h2><p>采用100%优质纯棉面料，柔软亲肤，透气舒适。经典圆领设计，百搭不挑人。</p><h3>面料特点</h3><ul><li>100% 纯棉</li><li>200g 加厚面料</li><li>预缩处理，不易变形</li></ul>', 'products/classic-crew-tee.jpg', 'on_sale', 1, 9900, 12900, 256);

INSERT OR IGNORE INTO product_images (product_id, image_key, sort_order) VALUES (1, 'products/classic-crew-tee.jpg', 0);
INSERT OR IGNORE INTO product_images (product_id, image_key, sort_order) VALUES (1, 'products/classic-crew-tee-2.jpg', 1);

INSERT OR IGNORE INTO spec_names (product_id, name, sort_order) VALUES (1, '颜色', 0);
INSERT OR IGNORE INTO spec_names (product_id, name, sort_order) VALUES (1, '尺码', 1);
INSERT OR IGNORE INTO spec_values (spec_name_id, value, sort_order) VALUES (1, '白色', 0);
INSERT OR IGNORE INTO spec_values (spec_name_id, value, sort_order) VALUES (1, '黑色', 1);
INSERT OR IGNORE INTO spec_values (spec_name_id, value, sort_order) VALUES (1, '灰色', 2);
INSERT OR IGNORE INTO spec_values (spec_name_id, value, sort_order) VALUES (2, 'S', 0);
INSERT OR IGNORE INTO spec_values (spec_name_id, value, sort_order) VALUES (2, 'M', 1);
INSERT OR IGNORE INTO spec_values (spec_name_id, value, sort_order) VALUES (2, 'L', 2);
INSERT OR IGNORE INTO spec_values (spec_name_id, value, sort_order) VALUES (2, 'XL', 3);

INSERT OR IGNORE INTO skus (product_id, sku_code, spec_desc, price, original_price, stock, weight) VALUES (1, 'CCT-WHT-S', '[{"name":"颜色","value":"白色"},{"name":"尺码","value":"S"}]', 9900, 12900, 50, 250);
INSERT OR IGNORE INTO skus (product_id, sku_code, spec_desc, price, original_price, stock, weight) VALUES (1, 'CCT-WHT-M', '[{"name":"颜色","value":"白色"},{"name":"尺码","value":"M"}]', 9900, 12900, 80, 260);
INSERT OR IGNORE INTO skus (product_id, sku_code, spec_desc, price, original_price, stock, weight) VALUES (1, 'CCT-WHT-L', '[{"name":"颜色","value":"白色"},{"name":"尺码","value":"L"}]', 9900, 12900, 60, 270);
INSERT OR IGNORE INTO skus (product_id, sku_code, spec_desc, price, original_price, stock, weight) VALUES (1, 'CCT-BLK-M', '[{"name":"颜色","value":"黑色"},{"name":"尺码","value":"M"}]', 9900, 12900, 100, 260);
INSERT OR IGNORE INTO skus (product_id, sku_code, spec_desc, price, original_price, stock, weight) VALUES (1, 'CCT-GRY-L', '[{"name":"颜色","value":"灰色"},{"name":"尺码","value":"L"}]', 10900, 12900, 40, 270);

-- 商品 2
INSERT OR IGNORE INTO products (category_id, brand_id, name, slug, subtitle, description, main_image, status, is_featured, price_min, price_max, sales_count)
VALUES (3, 1, '修身直筒牛仔裤', 'slim-straight-jeans', '弹力面料，舒适修身', '<h2>修身直筒牛仔裤</h2><p>精选优质弹力牛仔面料，修身而不紧绷。经典直筒版型，简约百搭。</p>', 'products/slim-straight-jeans.jpg', 'on_sale', 1, 19900, 19900, 128);

INSERT OR IGNORE INTO spec_names (product_id, name, sort_order) VALUES (2, '颜色', 0);
INSERT OR IGNORE INTO spec_names (product_id, name, sort_order) VALUES (2, '尺码', 1);
INSERT OR IGNORE INTO spec_values (spec_name_id, value, sort_order) VALUES (3, '深蓝', 0);
INSERT OR IGNORE INTO spec_values (spec_name_id, value, sort_order) VALUES (3, '浅蓝', 1);
INSERT OR IGNORE INTO spec_values (spec_name_id, value, sort_order) VALUES (4, '28', 0);
INSERT OR IGNORE INTO spec_values (spec_name_id, value, sort_order) VALUES (4, '30', 1);
INSERT OR IGNORE INTO spec_values (spec_name_id, value, sort_order) VALUES (4, '32', 2);

INSERT OR IGNORE INTO skus (product_id, sku_code, spec_desc, price, original_price, stock, weight) VALUES (2, 'SSJ-DB-28', '[{"name":"颜色","value":"深蓝"},{"name":"尺码","value":"28"}]', 19900, NULL, 30, 500);
INSERT OR IGNORE INTO skus (product_id, sku_code, spec_desc, price, original_price, stock, weight) VALUES (2, 'SSJ-DB-30', '[{"name":"颜色","value":"深蓝"},{"name":"尺码","value":"30"}]', 19900, NULL, 50, 520);
INSERT OR IGNORE INTO skus (product_id, sku_code, spec_desc, price, original_price, stock, weight) VALUES (2, 'SSJ-LB-32', '[{"name":"颜色","value":"浅蓝"},{"name":"尺码","value":"32"}]', 19900, NULL, 25, 540);

-- 商品 3
INSERT OR IGNORE INTO products (category_id, brand_id, name, slug, subtitle, description, main_image, status, is_featured, price_min, price_max, sales_count)
VALUES (4, 1, '复古跑步鞋', 'retro-runner', '轻量缓震，复古潮流', '<h2>复古跑步鞋</h2><p>灵感源自80年代经典跑鞋，搭配现代缓震科技，兼顾颜值与舒适。</p>', 'products/retro-runner.jpg', 'on_sale', 1, 29900, 29900, 89);

INSERT OR IGNORE INTO spec_names (product_id, name, sort_order) VALUES (3, '颜色', 0);
INSERT OR IGNORE INTO spec_names (product_id, name, sort_order) VALUES (3, '尺码', 1);
INSERT OR IGNORE INTO spec_values (spec_name_id, value, sort_order) VALUES (5, '白绿', 0);
INSERT OR IGNORE INTO spec_values (spec_name_id, value, sort_order) VALUES (5, '黑红', 1);
INSERT OR IGNORE INTO spec_values (spec_name_id, value, sort_order) VALUES (6, '40', 0);
INSERT OR IGNORE INTO spec_values (spec_name_id, value, sort_order) VALUES (6, '41', 1);
INSERT OR IGNORE INTO spec_values (spec_name_id, value, sort_order) VALUES (6, '42', 2);
INSERT OR IGNORE INTO spec_values (spec_name_id, value, sort_order) VALUES (6, '43', 3);

INSERT OR IGNORE INTO skus (product_id, sku_code, spec_desc, price, original_price, stock, weight) VALUES (3, 'RR-WG-40', '[{"name":"颜色","value":"白绿"},{"name":"尺码","value":"40"}]', 29900, NULL, 20, 650);
INSERT OR IGNORE INTO skus (product_id, sku_code, spec_desc, price, original_price, stock, weight) VALUES (3, 'RR-WG-42', '[{"name":"颜色","value":"白绿"},{"name":"尺码","value":"42"}]', 29900, NULL, 35, 680);
INSERT OR IGNORE INTO skus (product_id, sku_code, spec_desc, price, original_price, stock, weight) VALUES (3, 'RR-BR-41', '[{"name":"颜色","value":"黑红"},{"name":"尺码","value":"41"}]', 29900, NULL, 25, 670);

-- 商品 4
INSERT OR IGNORE INTO products (category_id, brand_id, name, slug, subtitle, description, main_image, status, is_featured, price_min, price_max, sales_count)
VALUES (5, 1, '极简金属手表', 'minimal-metal-watch', '日本机芯，极简设计', '<h2>极简金属手表</h2><p>日本石英机芯，不锈钢表壳，极简表盘设计。生活防水，商务休闲两相宜。</p>', 'products/minimal-watch.jpg', 'on_sale', 1, 59900, 59900, 45);

INSERT OR IGNORE INTO spec_names (product_id, name, sort_order) VALUES (4, '表盘颜色', 0);
INSERT OR IGNORE INTO spec_values (spec_name_id, value, sort_order) VALUES (7, '银白', 0);
INSERT OR IGNORE INTO spec_values (spec_name_id, value, sort_order) VALUES (7, '玫瑰金', 1);

INSERT OR IGNORE INTO skus (product_id, sku_code, spec_desc, price, original_price, stock, weight) VALUES (4, 'MMW-SLV', '[{"name":"表盘颜色","value":"银白"}]', 59900, NULL, 15, 120);
INSERT OR IGNORE INTO skus (product_id, sku_code, spec_desc, price, original_price, stock, weight) VALUES (4, 'MMW-RG', '[{"name":"表盘颜色","value":"玫瑰金"}]', 59900, NULL, 10, 120);

-- 商品 5
INSERT OR IGNORE INTO products (category_id, brand_id, name, slug, subtitle, description, main_image, status, is_featured, price_min, price_max, sales_count)
VALUES (6, 1, '通勤双肩背包', 'commute-backpack', '防泼水面料，大容量收纳', '<h2>通勤双肩背包</h2><p>防泼水尼龙面料，15.6寸笔记本隔层，多口袋设计。通勤出行的理想伙伴。</p>', 'products/commute-backpack.jpg', 'on_sale', 0, 39900, 39900, 67);

INSERT OR IGNORE INTO spec_names (product_id, name, sort_order) VALUES (5, '颜色', 0);
INSERT OR IGNORE INTO spec_values (spec_name_id, value, sort_order) VALUES (8, '黑色', 0);
INSERT OR IGNORE INTO spec_values (spec_name_id, value, sort_order) VALUES (8, '深灰', 1);

INSERT OR IGNORE INTO skus (product_id, sku_code, spec_desc, price, original_price, stock, weight) VALUES (5, 'CB-BLK', '[{"name":"颜色","value":"黑色"}]', 39900, NULL, 40, 750);
INSERT OR IGNORE INTO skus (product_id, sku_code, spec_desc, price, original_price, stock, weight) VALUES (5, 'CB-DGR', '[{"name":"颜色","value":"深灰"}]', 39900, NULL, 30, 750);

-- 商品 6（草稿状态）
INSERT OR IGNORE INTO products (category_id, brand_id, name, slug, subtitle, description, main_image, status, is_featured, price_min, price_max)
VALUES (2, 1, '法兰绒格纹衬衫', 'flannel-plaid-shirt', '秋冬必备，温暖厚实', '<p>柔软法兰绒面料，经典格纹图案。</p>', 'products/flannel-shirt.jpg', 'draft', 0, 15900, 15900);

-- 站点设置
INSERT OR IGNORE INTO site_settings (key, value) VALUES ('brand_name', 'BrandStore');
INSERT OR IGNORE INTO site_settings (key, value) VALUES ('brand_logo_letter', 'B');

-- 管理员账号（密码: admin123）
-- 注意：实际部署时需要更换密码
INSERT OR IGNORE INTO users (phone, nickname, role, password_hash) VALUES ('13800000000', '管理员', 'admin', 'placeholder-run-hash-on-first-login');
