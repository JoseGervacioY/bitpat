import mysql from "mysql2/promise";

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "bitpat",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Create the connection pool
const pool = mysql.createPool(dbConfig);

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  created_at: Date;
}

export interface PortfolioItem {
  id: number;
  user_id: number;
  coin_id: string;
  coin_name: string;
  amount: number;
  purchase_price: number;
  created_at: Date;
  updated_at: Date;
}

export interface Transaction {
  id: number;
  user_id: number;
  coin_id: string;
  coin_name: string;
  type: "buy" | "sell";
  amount: number;
  price: number;
  total_value: number;
  date: Date;
}

class Database {
  // User methods
  async findUserByEmail(email: string): Promise<User | undefined> {
    const [rows] = await pool.execute<any[]>(
      "SELECT * FROM users WHERE LOWER(email) = ?",
      [email.toLowerCase()]
    );
    return rows[0];
  }

  async findUserById(id: number): Promise<User | undefined> {
    const [rows] = await pool.execute<any[]>(
      "SELECT * FROM users WHERE id = ?",
      [id]
    );
    return rows[0];
  }

  async createUser(name: string, email: string, hashedPassword: string): Promise<User> {
    const [result] = await pool.execute<any>(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );
    const userId = result.insertId;
    return (await this.findUserById(userId))!;
  }

  // Portfolio methods
  async getPortfolioByUserId(userId: number): Promise<PortfolioItem[]> {
    const [rows] = await pool.execute<any[]>(
      "SELECT * FROM portfolio WHERE user_id = ?",
      [userId]
    );
    return rows.map(row => ({
      ...row,
      amount: Number(row.amount),
      purchase_price: Number(row.purchase_price)
    }));
  }

  async addPortfolioItem(userId: number, coinId: string, coinName: string, amount: number, purchasePrice: number): Promise<PortfolioItem> {
    // Check if user already has this coin
    const [existing] = await pool.execute<any[]>(
      "SELECT * FROM portfolio WHERE user_id = ? AND coin_id = ?",
      [userId, coinId]
    );

    if (existing.length > 0) {
      const existingItem = existing[0];
      const totalAmount = Number(existingItem.amount) + amount;
      const avgPrice = ((Number(existingItem.amount) * Number(existingItem.purchase_price)) + (amount * purchasePrice)) / totalAmount;
      
      await pool.execute(
        "UPDATE portfolio SET amount = ?, purchase_price = ? WHERE id = ?",
        [totalAmount, avgPrice, existingItem.id]
      );
      
      const [updated] = await pool.execute<any[]>(
        "SELECT * FROM portfolio WHERE id = ?",
        [existingItem.id]
      );
      const row = updated[0];
      return {
        ...row,
        amount: Number(row.amount),
        purchase_price: Number(row.purchase_price)
      };
    }

    const [result] = await pool.execute<any>(
      "INSERT INTO portfolio (user_id, coin_id, coin_name, amount, purchase_price) VALUES (?, ?, ?, ?, ?)",
      [userId, coinId, coinName, amount, purchasePrice]
    );
    
    const [newItem] = await pool.execute<any[]>(
      "SELECT * FROM portfolio WHERE id = ?",
      [result.insertId]
    );
    const row = newItem[0];
    return {
      ...row,
      amount: Number(row.amount),
      purchase_price: Number(row.purchase_price)
    };
  }

  async updatePortfolioItem(id: number, userId: number, amount: number, purchasePrice: number): Promise<PortfolioItem | null> {
    const [result] = await pool.execute<any>(
      "UPDATE portfolio SET amount = ?, purchase_price = ? WHERE id = ? AND user_id = ?",
      [amount, purchasePrice, id, userId]
    );

    if (result.affectedRows === 0) return null;

    const [rows] = await pool.execute<any[]>(
      "SELECT * FROM portfolio WHERE id = ?",
      [id]
    );
    const row = rows[0];
    return {
      ...row,
      amount: Number(row.amount),
      purchase_price: Number(row.purchase_price)
    };
  }

  async deletePortfolioItem(id: number, userId: number): Promise<boolean> {
    const [result] = await pool.execute<any>(
      "DELETE FROM portfolio WHERE id = ? AND user_id = ?",
      [id, userId]
    );
    return result.affectedRows > 0;
  }

  // Transaction methods
  async getTransactionsByUserId(userId: number, limit?: number): Promise<Transaction[]> {
    let query = "SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC";
    const params: any[] = [userId];

    if (limit) {
      query += " LIMIT ?";
      params.push(limit);
    }

    const [rows] = await pool.execute<any[]>(query, params);
    return rows.map(row => ({
      ...row,
      amount: Number(row.amount),
      price: Number(row.price),
      total_value: Number(row.total_value)
    }));
  }

  async addTransaction(
    userId: number,
    coinId: string,
    coinName: string,
    type: "buy" | "sell",
    amount: number,
    price: number
  ): Promise<Transaction> {
    const totalValue = amount * price;
    const [result] = await pool.execute<any>(
      "INSERT INTO transactions (user_id, coin_id, coin_name, type, amount, price, total_value) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [userId, coinId, coinName, type, amount, price, totalValue]
    );

    const [rows] = await pool.execute<any[]>(
      "SELECT * FROM transactions WHERE id = ?",
      [result.insertId]
    );
    const row = rows[0];
    return {
      ...row,
      amount: Number(row.amount),
      price: Number(row.price),
      total_value: Number(row.total_value)
    };
  }
}

export const db = new Database();
export { pool };
