from datetime import datetime, timedelta
import random
from decimal import Decimal
from server.extensions import db
from server.models import (
    User, Role, Customer, Order, OrderItem, OrderMaterial,
    OrderStatusHistory, InventoryItem, Equipment, Payment, Invoice
)

def seed_database():
    """Populate the database with realistic test data"""
    print("Starting database seed...")
    
    seed_users()
    seed_customers()
    seed_inventory()
    seed_equipment()
    seed_orders()
    
    print("Database seeding completed successfully!")

def seed_users():
    """Create sample users with different roles"""
    print("Seeding users...")
    
    users_data = [
        {
            'username': 'designer',
            'email': 'designer@sapaghor.com',
            'full_name': 'রাহুল আহমেদ',
            'phone': '01711234567',
            'role_name': 'Designer',
            'department': 'Design'
        },
        {
            'username': 'production_manager',
            'email': 'production@sapaghor.com',
            'full_name': 'করিম উদ্দিন',
            'phone': '01812345678',
            'role_name': 'Production',
            'department': 'Production'
        },
        {
            'username': 'accountant',
            'email': 'accounts@sapaghor.com',
            'full_name': 'ফাতেমা বেগম',
            'phone': '01912345678',
            'role_name': 'Accountant',
            'department': 'Finance'
        },
        {
            'username': 'delivery_person',
            'email': 'delivery@sapaghor.com',
            'full_name': 'জহির হোসেন',
            'phone': '01612345678',
            'role_name': 'Delivery',
            'department': 'Delivery'
        },
        {
            'username': 'designer2',
            'email': 'designer2@sapaghor.com',
            'full_name': 'সাকিব হাসান',
            'phone': '01521234567',
            'role_name': 'Designer',
            'department': 'Design'
        },
        {
            'username': 'manager',
            'email': 'manager@sapaghor.com',
            'full_name': 'নাজমুল হক',
            'phone': '01321234567',
            'role_name': 'Management',
            'department': 'Management'
        }
    ]
    
    for user_data in users_data:
        if not User.query.filter_by(username=user_data['username']).first():
            role = Role.query.filter_by(name=user_data['role_name']).first()
            user = User(
                username=user_data['username'],
                email=user_data['email'],
                full_name=user_data['full_name'],
                phone=user_data['phone'],
                role_id=role.id if role else None,
                department=user_data['department'],
                is_active=True
            )
            user.set_password('password123')
            db.session.add(user)
    
    db.session.commit()
    print(f"Created {len(users_data)} users")

def seed_customers():
    """Create sample customers with Bengali names"""
    print("Seeding customers...")
    
    customers_data = [
        {
            'company_name': 'ঢাকা প্রিন্টিং হাউস',
            'contact_person': 'মোহাম্মদ আলী',
            'email': 'dhaka.printing@email.com',
            'phone': '01711111111',
            'alternate_phone': '01811111111',
            'address': '১২৩ মতিঝিল, ঢাকা',
            'city': 'ঢাকা',
            'district': 'ঢাকা',
            'category': 'corporate',
            'credit_limit': 50000
        },
        {
            'company_name': 'রাজশাহী গ্রাফিক্স',
            'contact_person': 'আবুল কালাম',
            'email': 'rajshahi.graphics@email.com',
            'phone': '01722222222',
            'alternate_phone': '01822222222',
            'address': '৪৫ সাহেব বাজার, রাজশাহী',
            'city': 'রাজশাহী',
            'district': 'রাজশাহী',
            'category': 'regular',
            'credit_limit': 30000
        },
        {
            'company_name': 'চট্টগ্রাম প্রেস',
            'contact_person': 'সালমা খাতুন',
            'email': 'chittagong.press@email.com',
            'phone': '01733333333',
            'alternate_phone': '01833333333',
            'address': '৭৮ আগ্রাবাদ, চট্টগ্রাম',
            'city': 'চট্টগ্রাম',
            'district': 'চট্টগ্রাম',
            'category': 'corporate',
            'credit_limit': 75000
        },
        {
            'company_name': 'সিলেট অফসেট প্রিন্টার্স',
            'contact_person': 'রহিম উদ্দিন',
            'email': 'sylhet.offset@email.com',
            'phone': '01744444444',
            'address': '২৩ জিন্দাবাজার, সিলেট',
            'city': 'সিলেট',
            'district': 'সিলেট',
            'category': 'regular',
            'credit_limit': 25000
        },
        {
            'company_name': 'খুলনা প্রিন্টিং সলিউশন',
            'contact_person': 'আমিনুল ইসলাম',
            'email': 'khulna.printing@email.com',
            'phone': '01755555555',
            'address': '৫৬ শিববাড়ি মোড়, খুলনা',
            'city': 'খুলনা',
            'district': 'খুলনা',
            'category': 'corporate',
            'credit_limit': 40000
        },
        {
            'company_name': 'বরিশাল বুক হাউস',
            'contact_person': 'জাহিদ হাসান',
            'email': 'barisal.book@email.com',
            'phone': '01766666666',
            'address': '৮৯ সদর রোড, বরিশাল',
            'city': 'বরিশাল',
            'district': 'বরিশাল',
            'category': 'regular',
            'credit_limit': 20000
        },
        {
            'company_name': 'কুমিল্লা অ্যাড এজেন্সি',
            'contact_person': 'তানভীর আহমেদ',
            'email': 'comilla.ad@email.com',
            'phone': '01777777777',
            'address': '৩৪ কান্দিরপাড়, কুমিল্লা',
            'city': 'কুমিল্লা',
            'district': 'কুমিল্লা',
            'category': 'agency',
            'credit_limit': 60000
        },
        {
            'company_name': 'গাজীপুর মিডিয়া সার্ভিস',
            'contact_person': 'শাহিদা পারভীন',
            'email': 'gazipur.media@email.com',
            'phone': '01788888888',
            'address': '১০১ চৌরাস্তা, গাজীপুর',
            'city': 'গাজীপুর',
            'district': 'গাজীপুর',
            'category': 'agency',
            'credit_limit': 45000
        },
        {
            'company_name': 'নারায়ণগঞ্জ প্যাকেজিং',
            'contact_person': 'মাসুদ রানা',
            'email': 'narayanganj.pack@email.com',
            'phone': '01799999999',
            'address': '৬৭ তানবাজার, নারায়ণগঞ্জ',
            'city': 'নারায়ণগঞ্জ',
            'district': 'নারায়ণগঞ্জ',
            'category': 'corporate',
            'credit_limit': 80000
        },
        {
            'company_name': 'ময়মনসিংহ পাবলিশার্স',
            'contact_person': 'রবিউল আলম',
            'email': 'mymensingh.pub@email.com',
            'phone': '01610101010',
            'address': '২২ মাছ বাজার, ময়মনসিংহ',
            'city': 'ময়মনসিংহ',
            'district': 'ময়মনসিংহ',
            'category': 'regular',
            'credit_limit': 35000
        },
        {
            'company_name': 'রংপুর ডিজাইন সেন্টার',
            'contact_person': 'শফিকুল ইসলাম',
            'email': 'rangpur.design@email.com',
            'phone': '01520202020',
            'address': '৪৫ জিলা স্কুল রোড, রংপুর',
            'city': 'রংপুর',
            'district': 'রংপুর',
            'category': 'regular',
            'credit_limit': 28000
        },
        {
            'company_name': 'দিনাজপুর ক্রিয়েটিভ',
            'contact_person': 'নুরুল হুদা',
            'email': 'dinajpur.creative@email.com',
            'phone': '01330303030',
            'address': '১৮ মুন্সিপাড়া, দিনাজপুর',
            'city': 'দিনাজপুর',
            'district': 'দিনাজপুর',
            'category': 'agency',
            'credit_limit': 22000
        }
    ]
    
    for customer_data in customers_data:
        if not Customer.query.filter_by(company_name=customer_data['company_name']).first():
            customer = Customer(**customer_data)
            db.session.add(customer)
    
    db.session.commit()
    print(f"Created {len(customers_data)} customers")

def seed_inventory():
    """Create sample inventory items"""
    print("Seeding inventory...")
    
    inventory_data = [
        {
            'sku': 'PAP-A4-BOND',
            'name': 'A4 Bond Paper (80gsm)',
            'description': 'Standard A4 bond paper for printing',
            'category': 'Paper',
            'material_type': 'paper',
            'unit': 'rim',
            'current_stock': 150,
            'minimum_stock': 20,
            'reorder_level': 30,
            'unit_cost': 450,
            'selling_price': 550
        },
        {
            'sku': 'PAP-A3-ART',
            'name': 'A3 Art Paper (130gsm)',
            'description': 'High quality art paper for brochures',
            'category': 'Paper',
            'material_type': 'paper',
            'unit': 'rim',
            'current_stock': 80,
            'minimum_stock': 10,
            'reorder_level': 20,
            'unit_cost': 1200,
            'selling_price': 1500
        },
        {
            'sku': 'PAP-GLOSSY',
            'name': 'Glossy Photo Paper',
            'description': 'Premium glossy paper for photos',
            'category': 'Paper',
            'material_type': 'paper',
            'unit': 'pack',
            'current_stock': 45,
            'minimum_stock': 10,
            'reorder_level': 15,
            'unit_cost': 800,
            'selling_price': 1000
        },
        {
            'sku': 'INK-CMYK-SET',
            'name': 'CMYK Ink Set',
            'description': 'Complete CMYK ink set for offset printing',
            'category': 'Ink',
            'material_type': 'ink',
            'unit': 'set',
            'current_stock': 25,
            'minimum_stock': 5,
            'reorder_level': 8,
            'unit_cost': 3500,
            'selling_price': 4200
        },
        {
            'sku': 'INK-BLACK',
            'name': 'Black Ink',
            'description': 'High quality black ink for text printing',
            'category': 'Ink',
            'material_type': 'ink',
            'unit': 'kg',
            'current_stock': 60,
            'minimum_stock': 10,
            'reorder_level': 15,
            'unit_cost': 1200,
            'selling_price': 1500
        },
        {
            'sku': 'MAT-PVC-SHEET',
            'name': 'PVC Sheet',
            'description': 'PVC sheets for banners and signage',
            'category': 'Material',
            'material_type': 'pvc',
            'unit': 'sheet',
            'current_stock': 100,
            'minimum_stock': 20,
            'reorder_level': 30,
            'unit_cost': 350,
            'selling_price': 450
        },
        {
            'sku': 'MAT-STICKER',
            'name': 'Sticker Roll (Vinyl)',
            'description': 'Self-adhesive vinyl sticker roll',
            'category': 'Material',
            'material_type': 'sticker',
            'unit': 'roll',
            'current_stock': 35,
            'minimum_stock': 5,
            'reorder_level': 10,
            'unit_cost': 2500,
            'selling_price': 3200
        },
        {
            'sku': 'MAT-LAMINATE',
            'name': 'Lamination Film (Glossy)',
            'description': 'Glossy lamination film roll',
            'category': 'Material',
            'material_type': 'consumable',
            'unit': 'roll',
            'current_stock': 20,
            'minimum_stock': 3,
            'reorder_level': 5,
            'unit_cost': 1800,
            'selling_price': 2200
        },
        {
            'sku': 'BND-SPIRAL',
            'name': 'Spiral Binding Wire',
            'description': 'Metal spiral binding wire assorted sizes',
            'category': 'Binding',
            'material_type': 'binding',
            'unit': 'box',
            'current_stock': 50,
            'minimum_stock': 10,
            'reorder_level': 15,
            'unit_cost': 600,
            'selling_price': 800
        },
        {
            'sku': 'BND-PERFECT',
            'name': 'Perfect Binding Glue',
            'description': 'Hot melt glue for perfect binding',
            'category': 'Binding',
            'material_type': 'binding',
            'unit': 'kg',
            'current_stock': 30,
            'minimum_stock': 5,
            'reorder_level': 10,
            'unit_cost': 400,
            'selling_price': 550
        },
        {
            'sku': 'PLT-OFFSET',
            'name': 'Offset Printing Plate',
            'description': 'Aluminum offset printing plates',
            'category': 'Plate',
            'material_type': 'consumable',
            'unit': 'piece',
            'current_stock': 200,
            'minimum_stock': 30,
            'reorder_level': 50,
            'unit_cost': 250,
            'selling_price': 350
        },
        {
            'sku': 'MAT-MATTE-LAM',
            'name': 'Lamination Film (Matte)',
            'description': 'Matte finish lamination film',
            'category': 'Material',
            'material_type': 'consumable',
            'unit': 'roll',
            'current_stock': 15,
            'minimum_stock': 3,
            'reorder_level': 5,
            'unit_cost': 2000,
            'selling_price': 2500
        }
    ]
    
    for item_data in inventory_data:
        if not InventoryItem.query.filter_by(sku=item_data['sku']).first():
            item = InventoryItem(**item_data)
            db.session.add(item)
    
    db.session.commit()
    print(f"Created {len(inventory_data)} inventory items")

def seed_equipment():
    """Create sample equipment"""
    print("Seeding equipment...")
    
    equipment_data = [
        {
            'name': 'Offset Press Machine - Heidelberg SM74',
            'equipment_type': 'printing',
            'description': '4-color offset printing machine',
            'status': 'available',
            'location': 'Production Floor - Section A'
        },
        {
            'name': 'Digital Printing Machine - HP Indigo',
            'equipment_type': 'printing',
            'description': 'Digital press for short runs',
            'status': 'available',
            'location': 'Production Floor - Section B'
        },
        {
            'name': 'Lamination Machine - GMP Excelam',
            'equipment_type': 'finishing',
            'description': 'Hot and cold lamination machine',
            'status': 'available',
            'location': 'Finishing Section'
        },
        {
            'name': 'Binding Machine - Horizon BQ-270',
            'equipment_type': 'binding',
            'description': 'Perfect binding machine',
            'status': 'available',
            'location': 'Binding Section'
        },
        {
            'name': 'Paper Cutting Machine - Polar 92',
            'equipment_type': 'cutting',
            'description': 'Programmable paper guillotine',
            'status': 'available',
            'location': 'Pre-press Section'
        },
        {
            'name': 'Spiral Binding Machine',
            'equipment_type': 'binding',
            'description': 'Manual spiral binding machine',
            'status': 'available',
            'location': 'Binding Section'
        },
        {
            'name': 'UV Coating Machine',
            'equipment_type': 'finishing',
            'description': 'Spot and full UV coating machine',
            'status': 'maintenance',
            'location': 'Finishing Section'
        },
        {
            'name': 'CTP Machine - Kodak Magnus',
            'equipment_type': 'prepress',
            'description': 'Computer-to-plate imaging system',
            'status': 'available',
            'location': 'Pre-press Section'
        }
    ]
    
    for eq_data in equipment_data:
        if not Equipment.query.filter_by(name=eq_data['name']).first():
            equipment = Equipment(**eq_data)
            db.session.add(equipment)
    
    db.session.commit()
    print(f"Created {len(equipment_data)} equipment items")

def seed_orders():
    """Create sample orders with items and payments"""
    print("Seeding orders...")
    
    customers = Customer.query.all()
    admin_user = User.query.filter_by(username='admin').first()
    
    if not customers:
        print("No customers found. Skipping orders.")
        return
    
    work_names = [
        'Visiting Card', 'Business Card', 'Letterhead', 'Bill Book', 'Money Receipt',
        'Poster', 'Banner', 'Brochure', 'Flyer', 'Catalog', 'Magazine',
        'Wedding Card', 'Invitation Card', 'Calendar', 'Diary', 'Notebook',
        'Packaging Box', 'Label Sticker', 'Certificate', 'ID Card', 'Menu Card'
    ]
    
    sizes = ['A4', 'A5', 'A3', '3x2 inch', '4x6 inch', '8.5x11 inch', '12x18 inch', 
             '24x36 inch', '10x15 cm', '20x30 cm', 'Custom']
    
    colors = ['4-Color (CMYK)', '2-Color', 'Black & White', 'Single Color', 'Full Color + Spot UV']
    
    statuses = ['order', 'design_sent', 'proof_given', 'proof_complete', 'plate_setting',
                'printing_complete', 'binding_sent', 'order_ready', 'delivered']
    
    order_types = ['regular_order', 'pre_order']
    payment_statuses = ['paid', 'partial', 'pending']
    
    orders_created = 0
    today = datetime.now()
    
    for i in range(25):
        customer = random.choice(customers)
        status = random.choice(statuses)
        order_type = random.choice(order_types)
        
        order_date = today - timedelta(days=random.randint(1, 60))
        expected_delivery = order_date + timedelta(days=random.randint(3, 15))
        
        order = Order(
            order_number=f"SAP{order_date.strftime('%y%m')}{str(i+1).zfill(4)}",
            customer_id=customer.id,
            order_type=order_type,
            status=status,
            work_name=random.choice(work_names),
            description=f"Sample order for {customer.company_name}",
            order_date=order_date,
            expected_delivery_date=expected_delivery,
            design_fee=random.choice([0, 500, 1000, 1500, 2000]) if random.random() > 0.5 else 0,
            urgency_fee=random.choice([0, 500, 1000, 2000]) if random.random() > 0.7 else 0,
            created_by=admin_user.id if admin_user else None
        )
        
        if status == 'delivered':
            order.actual_delivery_date = expected_delivery + timedelta(days=random.randint(-2, 3))
        
        db.session.add(order)
        db.session.flush()
        
        num_items = random.randint(1, 4)
        subtotal = Decimal('0')
        
        for j in range(num_items):
            quantity = random.choice([100, 250, 500, 1000, 2000, 5000, 10000])
            unit_price = Decimal(str(random.choice([2, 3, 5, 8, 10, 15, 20, 25])))
            total_price = quantity * unit_price
            
            plate_cost = Decimal(str(random.randint(200, 800)))
            paper_cost = Decimal(str(random.randint(500, 3000)))
            ink_cost = Decimal(str(random.randint(100, 500)))
            binding_cost = Decimal(str(random.randint(0, 1000))) if random.random() > 0.5 else Decimal('0')
            laminating_cost = Decimal(str(random.randint(0, 800))) if random.random() > 0.6 else Decimal('0')
            
            item = OrderItem(
                order_id=order.id,
                product_name=random.choice(work_names),
                description=f"High quality {random.choice(colors)} print",
                quantity=quantity,
                size=random.choice(sizes),
                color=random.choice(colors),
                material_type=random.choice(['art_paper', 'bond_paper', 'glossy', 'matte', 'pvc']),
                unit_price=unit_price,
                total_price=total_price,
                plate=plate_cost,
                paper=paper_cost,
                ink=ink_cost,
                binding=binding_cost,
                laminating=laminating_cost,
                printing=Decimal(str(random.randint(200, 1000)))
            )
            db.session.add(item)
            subtotal += total_price
        
        order.subtotal = subtotal
        extra_fees = (order.design_fee or 0) + (order.urgency_fee or 0)
        order.discount = Decimal(str(random.choice([0, 100, 200, 500]))) if random.random() > 0.7 else Decimal('0')
        order.total_amount = subtotal + Decimal(str(extra_fees)) - order.discount
        
        payment_status = random.choice(payment_statuses)
        order.payment_status = payment_status
        
        if payment_status == 'paid':
            order.paid_amount = order.total_amount
            order.due_amount = Decimal('0')
        elif payment_status == 'partial':
            paid_percent = random.choice([0.25, 0.5, 0.75])
            order.paid_amount = round(order.total_amount * Decimal(str(paid_percent)), 2)
            order.due_amount = order.total_amount - order.paid_amount
        else:
            order.paid_amount = Decimal('0')
            order.due_amount = order.total_amount
        
        status_history = OrderStatusHistory(
            order_id=order.id,
            status='order',
            notes='Order created',
            changed_by=admin_user.id if admin_user else None,
            changed_at=order_date
        )
        db.session.add(status_history)
        
        if order.paid_amount > 0:
            payment = Payment(
                payment_number=f"PAY{order_date.strftime('%y%m')}{str(i+1).zfill(4)}",
                order_id=order.id,
                amount=order.paid_amount,
                payment_type='advance' if payment_status == 'partial' else 'full',
                payment_method=random.choice(['cash', 'bank_transfer', 'mobile_banking']),
                payment_date=order_date + timedelta(days=random.randint(0, 3)),
                notes=f"Payment received from {customer.company_name}",
                received_by=admin_user.id if admin_user else None
            )
            db.session.add(payment)
        
        orders_created += 1
    
    db.session.commit()
    print(f"Created {orders_created} orders with items and payments")

def check_if_seeded():
    """Check if the database has been seeded (has more than just admin user)"""
    user_count = User.query.count()
    customer_count = Customer.query.count()
    return user_count > 1 or customer_count > 0

def seed_if_empty():
    """Seed the database only if it's empty (except for admin)"""
    if not check_if_seeded():
        print("Database is empty. Running seed...")
        seed_database()
    else:
        print("Database already has data. Skipping seed.")
