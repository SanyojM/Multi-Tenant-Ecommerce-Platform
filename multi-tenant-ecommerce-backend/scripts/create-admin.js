#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const readline = require('readline');

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createAdmin() {
  console.log('\n=== Create Admin User ===\n');

  try {
    const email = await question('Email: ');
    const password = await question('Password: ');
    const name = await question('Name (optional): ');
    const roleInput = await question('Role (1=SUPER_ADMIN, 2=STORE_OWNER): ');
    
    const role = roleInput === '1' ? 'SUPER_ADMIN' : 'STORE_OWNER';
    
    let storeId = null;
    if (role === 'STORE_OWNER') {
      // List available stores
      const stores = await prisma.store.findMany({
        select: {
          id: true,
          name: true,
        }
      });
      
      console.log('\nAvailable Stores:');
      stores.forEach((store, index) => {
        console.log(`${index + 1}. ${store.name} (${store.id})`);
      });
      
      const storeIndex = await question('\nSelect store number: ');
      const selectedStore = stores[parseInt(storeIndex) - 1];
      
      if (!selectedStore) {
        console.error('Invalid store selection');
        process.exit(1);
      }
      
      storeId = selectedStore.id;
      
      // Check if store already has an owner
      const existingOwner = await prisma.storeAdmin.findFirst({
        where: {
          storeId,
          role: 'STORE_OWNER'
        }
      });
      
      if (existingOwner) {
        console.error('This store already has an owner!');
        process.exit(1);
      }
    }
    
    // Check if email already exists
    const existingAdmin = await prisma.storeAdmin.findUnique({
      where: { email }
    });
    
    if (existingAdmin) {
      console.error('An admin with this email already exists!');
      process.exit(1);
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create admin
    const admin = await prisma.storeAdmin.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        role,
        storeId,
      },
      include: {
        store: true
      }
    });
    
    console.log('\n✅ Admin created successfully!');
    console.log(`Email: ${admin.email}`);
    console.log(`Role: ${admin.role}`);
    if (admin.store) {
      console.log(`Store: ${admin.store.name}`);
    }
    
  } catch (error) {
    console.error('Error creating admin:', error.message);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

createAdmin();
