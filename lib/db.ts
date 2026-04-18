import { SupabaseClient } from "@supabase/supabase-js";
import { supabase as defaultSupabase } from "./supabase";

export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface PortfolioItem {
  id: string;
  user_id: string;
  coin_id: string;
  coin_name: string;
  coin_symbol: string;
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
  /**
   * Helper to use a provided authenticated client or the default one.
   */
  private getClient(client?: SupabaseClient) {
    return client || defaultSupabase;
  }

  // User methods
  async findUserByEmail(email: string): Promise<User | undefined> {
    const { data, error } = await defaultSupabase
      .from("profiles")
      .select("*")
      .eq("email", email.toLowerCase())
      .single();
    
    if (error || !data) return undefined;
    return data as User;
  }

  async findUserById(id: string): Promise<User | undefined> {
    const { data, error } = await defaultSupabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();
    
    if (error || !data) return undefined;
    return data as User;
  }

  // Portfolio methods
  async getPortfolioByUserId(userId: string, authClient?: SupabaseClient): Promise<PortfolioItem[]> {
    const { data, error } = await this.getClient(authClient)
      .from("portfolio_assets")
      .select("*")
      .eq("user_id", userId);
    
    if (error) {
      console.error("DB Error getPortfolioByUserId:", error);
      return [];
    }
    return data as PortfolioItem[];
  }

  async addPortfolioItem(
    userId: string, 
    coinId: string, 
    coinName: string, 
    coinSymbol: string,
    amount: number, 
    purchasePrice: number,
    authClient?: SupabaseClient
  ): Promise<PortfolioItem> {
    const client = this.getClient(authClient);

    // Check if user already has this coin
    const { data: existing } = await client
      .from("portfolio_assets")
      .select("*")
      .eq("user_id", userId)
      .eq("coin_id", coinId)
      .single();

    if (existing) {
      const totalAmount = Number(existing.amount) + amount;
      const avgPrice = ((Number(existing.amount) * Number(existing.purchase_price)) + (amount * purchasePrice)) / totalAmount;
      
      const { data: updated, error } = await client
        .from("portfolio_assets")
        .update({
          amount: totalAmount,
          purchase_price: avgPrice,
          updated_at: new Date().toISOString()
        })
        .eq("id", existing.id)
        .select()
        .single();
      
      if (error) {
        console.error("DB Error updating portfolio_assets:", error);
        throw error;
      }
      return updated as PortfolioItem;
    }

    const { data: inserted, error } = await client
      .from("portfolio_assets")
      .insert([
        {
          user_id: userId,
          coin_id: coinId,
          coin_name: coinName,
          coin_symbol: coinSymbol,
          amount: amount,
          purchase_price: purchasePrice
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error("DB Error inserting into portfolio_assets:", error);
      throw error;
    }
    return inserted as PortfolioItem;
  }

  async updatePortfolioItem(id: string, userId: string, amount: number, purchasePrice: number, authClient?: SupabaseClient): Promise<PortfolioItem | null> {
    const { data, error } = await this.getClient(authClient)
      .from("portfolio_assets")
      .update({
        amount,
        purchase_price: purchasePrice,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("DB Error updatePortfolioItem:", error);
      return null;
    }
    return data as PortfolioItem;
  }

  async deletePortfolioItem(id: string, userId: string, authClient?: SupabaseClient): Promise<boolean> {
    const { error } = await this.getClient(authClient)
      .from("portfolio_assets")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    
    if (error) {
      console.error("DB Error deletePortfolioItem:", error);
    }
    return !error;
  }

  // Transaction methods
  async getTransactionsByUserId(userId: string, limit?: number, authClient?: SupabaseClient): Promise<Transaction[]> {
    let query = this.getClient(authClient)
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) {
      console.error("DB Error getTransactionsByUserId:", error);
      return [];
    }
    return data as Transaction[];
  }

  async addTransaction(
    userId: string,
    coinId: string,
    coinName: string,
    type: "buy" | "sell",
    amount: number,
    price: number,
    authClient?: SupabaseClient
  ): Promise<Transaction> {
    const totalValue = amount * price;
    const { data, error } = await this.getClient(authClient)
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

    if (error) {
      console.error("DB Error addTransaction:", error);
      throw error;
    }
    return data as Transaction;
  }
}

export const db = new Database();
