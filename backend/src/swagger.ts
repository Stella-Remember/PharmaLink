// src/swagger.ts
export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'PharmaLink Pharmacy Management API',
    version: '1.0.0',
    description: `
      # PharmaLink Backend API
      Complete pharmacy inventory and management system with role-based access.
      
      ## Features
      - 👥 **Authentication** - JWT-based with role selection (Owner/Pharmacist)
      - 🏪 **Multi-store Management** - Owners can manage multiple pharmacies
      - 💊 **Inventory Control** - Track stock, expiry dates, low stock alerts
      - 💰 **POS/Sales** - Process transactions with automatic inventory updates
      - 📋 **Claims Management** - Handle damaged/expired medicine claims
      - 📊 **Dashboard** - Real-time statistics and alerts
    `,
    contact: {
      name: 'PharmaLink Support',
      email: 'support@pharmalink.com'
    }
  },
  servers: [
    {
      url: 'http://localhost:3001',
      description: 'Development server'
    },
    {
      url: 'https://your-production-url.com',
      description: 'Production server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          role: { type: 'string', enum: ['PHARMACY_OWNER', 'PHARMACIST'] },
          isActive: { type: 'boolean' }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password', 'role'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', format: 'password' },
          role: { type: 'string', enum: ['PHARMACY_OWNER', 'PHARMACIST'] }
        }
      },
      LoginResponse: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          token: { type: 'string' },
          user: { $ref: '#/components/schemas/User' },
          pharmacyId: { type: 'string' },
          pharmacyName: { type: 'string' }
        }
      },
      InventoryItem: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          medicineName: { type: 'string' },
          batchNumber: { type: 'string' },
          expiryDate: { type: 'string', format: 'date' },
          currentStock: { type: 'integer' },
          reorderLevel: { type: 'integer' },
          sellingPrice: { type: 'number' },
          status: { type: 'string', enum: ['In Stock', 'Low Stock'] }
        }
      },
      LowStockAlert: {
        type: 'object',
        properties: {
          medicine: { type: 'string' },
          currentStock: { type: 'integer' },
          reorderLevel: { type: 'integer' },
          status: { type: 'string' }
        }
      },
      DashboardStats: {
        type: 'object',
        properties: {
          totalMedicines: { type: 'integer' },
          lowStockCount: { type: 'integer' },
          todaySales: { type: 'number' },
          pendingClaims: { type: 'integer' }
        }
      }
    }
  },
  paths: {
    '/api/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new user',
        description: 'Create a new account. Pharmacy owners must provide pharmacy details.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'firstName', 'lastName', 'role'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', format: 'password' },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  role: { type: 'string', enum: ['PHARMACY_OWNER', 'PHARMACIST'] },
                  pharmacyName: { type: 'string', description: 'Required for PHARMACY_OWNER' },
                  licenseNumber: { type: 'string', description: 'Required for PHARMACY_OWNER' }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Registration successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    user: { $ref: '#/components/schemas/User' },
                    pharmacy: { type: 'object' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Login with role selection',
        description: 'Authenticate user and return JWT token. Role must match account type.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' }
            }
          }
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginResponse' }
              }
            }
          }
        }
      }
    },
    '/api/dashboard/stats': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get dashboard statistics',
        description: 'Returns overview stats: total medicines, low stock count, today\'s sales, pending claims',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Dashboard stats retrieved',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/DashboardStats' }
              }
            }
          }
        }
      }
    },
    '/api/dashboard/low-stock': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get low stock alerts',
        description: 'Returns medicines below reorder level',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Low stock alerts retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/LowStockAlert' }
                }
              }
            }
          }
        }
      }
    },
    '/api/inventory': {
      get: {
        tags: ['Inventory'],
        summary: 'List inventory items',
        description: 'Get all inventory items with optional filters',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'category',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filter by category'
          },
          {
            name: 'expiry',
            in: 'query',
            schema: { type: 'string', enum: ['expiring'] },
            description: 'Filter expiring items'
          },
          {
            name: 'lowStock',
            in: 'query',
            schema: { type: 'boolean' },
            description: 'Filter low stock items'
          },
          {
            name: 'search',
            in: 'query',
            schema: { type: 'string' },
            description: 'Search by medicine name'
          }
        ],
        responses: {
          200: {
            description: 'Inventory list retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/InventoryItem' }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Inventory'],
        summary: 'Add inventory item',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['medicineName', 'batchNumber', 'expiryDate', 'quantity', 'reorderLevel', 'sellingPrice'],
                properties: {
                  medicineName: { type: 'string' },
                  genericName: { type: 'string' },
                  category: { type: 'string' },
                  manufacturer: { type: 'string' },
                  strength: { type: 'string' },
                  form: { type: 'string' },
                  batchNumber: { type: 'string' },
                  expiryDate: { type: 'string', format: 'date' },
                  quantity: { type: 'integer' },
                  reorderLevel: { type: 'integer' },
                  unitPrice: { type: 'number' },
                  sellingPrice: { type: 'number' },
                  supplierId: { type: 'string' },
                  location: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Inventory item created'
          }
        }
      }
    },
    '/api/inventory/{id}': {
      put: {
        tags: ['Inventory'],
        summary: 'Update inventory item',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  quantity: { type: 'integer' },
                  sellingPrice: { type: 'number' },
                  location: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Inventory item updated'
          }
        }
      },
      delete: {
        tags: ['Inventory'],
        summary: 'Delete inventory item',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          200: {
            description: 'Inventory item deleted'
          }
        }
      }
    },
    '/api/inventory/{id}/stock': {
      patch: {
        tags: ['Inventory'],
        summary: 'Adjust stock quantity',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['adjustment'],
                properties: {
                  adjustment: { type: 'integer', description: 'Positive to add, negative to remove' },
                  reason: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Stock adjusted'
          }
        }
      }
    },
    '/api/sales': {
      get: {
        tags: ['Sales'],
        summary: 'List sales',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'startDate',
            in: 'query',
            schema: { type: 'string', format: 'date' }
          },
          {
            name: 'endDate',
            in: 'query',
            schema: { type: 'string', format: 'date' }
          }
        ],
        responses: {
          200: {
            description: 'Sales list retrieved'
          }
        }
      },
      post: {
        tags: ['Sales'],
        summary: 'Create sale',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['items'],
                properties: {
                  items: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['inventoryId', 'quantity'],
                      properties: {
                        inventoryId: { type: 'string' },
                        quantity: { type: 'integer' }
                      }
                    }
                  },
                  customerName: { type: 'string' },
                  customerEmail: { type: 'string' },
                  discount: { type: 'number' }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Sale created'
          }
        }
      }
    },
    '/api/sales/today': {
      get: {
        tags: ['Sales'],
        summary: 'Get today\'s sales total',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Today\'s sales retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    total: { type: 'number' },
                    count: { type: 'integer' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/claims': {
      get: {
        tags: ['Claims'],
        summary: 'List claims',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED', 'PROCESSED'] }
          }
        ],
        responses: {
          200: {
            description: 'Claims list retrieved'
          }
        }
      },
      post: {
        tags: ['Claims'],
        summary: 'Create claim',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['claimType', 'description', 'quantity'],
                properties: {
                  inventoryId: { type: 'string' },
                  claimType: { type: 'string' },
                  description: { type: 'string' },
                  quantity: { type: 'integer' },
                  amount: { type: 'number' }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Claim created'
          }
        }
      }
    },
    '/api/claims/{id}/status': {
      patch: {
        tags: ['Claims'],
        summary: 'Update claim status',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { type: 'string', enum: ['APPROVED', 'REJECTED', 'PROCESSED'] },
                  notes: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Claim status updated'
          }
        }
      }
    },
    '/api/claims/pending/count': {
      get: {
        tags: ['Claims'],
        summary: 'Get pending claims count',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Pending claims count',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    count: { type: 'integer' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/pharmacies': {
      get: {
        tags: ['Pharmacies'],
        summary: 'Get owner\'s pharmacies',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Pharmacies retrieved'
          }
        }
      },
      post: {
        tags: ['Pharmacies'],
        summary: 'Create pharmacy',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'licenseNumber'],
                properties: {
                  name: { type: 'string' },
                  address: { type: 'string' },
                  phone: { type: 'string' },
                  email: { type: 'string' },
                  licenseNumber: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Pharmacy created'
          }
        }
      }
    },
    '/api/pharmacies/{pharmacyId}/staff': {
      get: {
        tags: ['Pharmacies'],
        summary: 'Get pharmacy staff',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'pharmacyId',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          200: {
            description: 'Staff list retrieved'
          }
        }
      },
      post: {
        tags: ['Pharmacies'],
        summary: 'Assign pharmacist',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'pharmacyId',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'firstName', 'lastName'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Pharmacist assigned'
          }
        }
      }
    },
    '/health': {
      get: {
        tags: ['System'],
        summary: 'Health check',
        description: 'Check if API is running and database is connected',
        responses: {
          200: {
            description: 'API is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    timestamp: { type: 'string' },
                    database: { type: 'string' },
                    prisma: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  tags: [
    { name: 'Authentication', description: 'User registration and login' },
    { name: 'Dashboard', description: 'Dashboard statistics and alerts' },
    { name: 'Inventory', description: 'Medicine inventory management' },
    { name: 'Sales', description: 'Point of sale transactions' },
    { name: 'Claims', description: 'Damage and expiry claims' },
    { name: 'Pharmacies', description: 'Pharmacy management (owner only)' },
    { name: 'System', description: 'System health and status' }
  ]
};
