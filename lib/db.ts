import { supabase } from "./supabase";

export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface PortfolioItem {
  id: string; // Changed to string for Postgres UUID/BigInt
  user_id: string;
  coin_id: string;
  coin_name: string;
  amount: number;
  purchase_price: number;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  coin_id: string;
  coin_name: string;
  type: "buy" | "sell";
  amount: number;
  price: number;
  total_value: number;
  date: string;
}

class Database {
  // User methods
  async findUserByEmail(email: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email.toLowerCase())
      .single();
    
    if (error || !data) return undefined;
    return data as User;
  }

  async findUserById(id: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();
    
    if (error || !data) return undefined;
    return data as User;
  }

  // Portfolio methods
  async getPortfolioByUserId(userId: string): Promise<PortfolioItem[]> {
    const { data, error } = await supabase
      .from("portfolio")
      .select("*")
      .eq("user_id", userId);
    
    if (error) return [];
    return data as PortfolioItem[];
  }

  async addPortfolioItem(userId: string, coinId: string, coinName: string, amount: number, purchasePrice: number): Promise<PortfolioItem> {
    // Check if user already has this coin
    const { data: existing } = await supabase
      .from("portfolio")
      .select("*")
      .eq("user_id", userId)
      .eq("coin_id", coinId)
      .single();

    if (existing) {
      const totalAmount = Number(existing.amount) + amount;
      const avgPrice = ((Number(existing.amount) * Number(existing.purchase_price)) + (amount * purchasePrice)) / totalAmount;
      
      const { data: updated, error } = await supabase
        .from("portfolio")
        .update({
          amount: totalAmount,
          purchase_price: avgPrice,
          updated_at: new Date().toISOString()
        })
        .eq("id", existing.id)
        .select()
        .single();
      
      if (error) throw error;
      return updated as PortfolioItem;
    }

    const { data: inserted, error } = await supabase
      .from("portfolio")
      .insert([
        {
          user_id: userId,
          coin_id: coinId,
          coin_name: coinName,
          amount: amount,
          purchase_price: purchasePrice
        }
      ])
      .select()
      .single();
    
    if (error) throw error;
    return inserted as PortfolioItem;
  }

  async updatePortfolioItem(id: string, userId: string, amount: number, purchasePrice: number): Promise<PortfolioItem | null> {
    const { data, error } = await supabase
      .from("portfolio")
      .update({
        amount,
        purchase_price: purchasePrice,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) return null;
    return data as PortfolioItem;
  }

  async deletePortfolioItem(id: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from("portfolio")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    
    return !error;
  }

  // Transaction methods
  async getTransactionsByUserId(userId: string, limit?: number): Promise<Transaction[]> {
    let query = supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) return [];
    return data as Transaction[];
  }

  async addTransaction(
    userId: string,
    coinId: string,
    coinName: string,
    type: "buy" | "sell",
    amount: number,
    price: number
  ): Promise<Transaction> {
    const totalValue = amount * price;
    const { data, error } = await supabase
      .from("transactions")
      .insert([
        {
          user_id: userId,
          coin_id: coinId,
          coin_name: coinName,
          type: type,
          amount: amount,
          price: price,
          total_value: totalValue
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data as Transaction;
  }
}

export const db = new Database();
