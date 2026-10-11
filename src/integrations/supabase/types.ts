export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      categorias_gastos: {
        Row: {
          created_at: string | null
          id: string
          nome: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          nome: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          nome?: string
          user_id?: string | null
        }
        Relationships: []
      }
      emprestimos: {
        Row: {
          created_at: string | null
          credor: string
          descricao: string
          id: string
          saldo_devedor: number
          total_pago: number | null
          user_id: string | null
          valor_original: number
        }
        Insert: {
          created_at?: string | null
          credor: string
          descricao: string
          id?: string
          saldo_devedor: number
          total_pago?: number | null
          user_id?: string | null
          valor_original: number
        }
        Update: {
          created_at?: string | null
          credor?: string
          descricao?: string
          id?: string
          saldo_devedor?: number
          total_pago?: number | null
          user_id?: string | null
          valor_original?: number
        }
        Relationships: []
      }
      gastos_fixos: {
        Row: {
          categoria: string
          created_at: string | null
          data: string
          id: string
          mes_ano: string | null
          user_id: string | null
          valor: number
        }
        Insert: {
          categoria: string
          created_at?: string | null
          data: string
          id?: string
          mes_ano?: string | null
          user_id?: string | null
          valor: number
        }
        Update: {
          categoria?: string
          created_at?: string | null
          data?: string
          id?: string
          mes_ano?: string | null
          user_id?: string | null
          valor?: number
        }
        Relationships: []
      }
      lancamentos: {
        Row: {
          categoria: string
          combustivel: string | null
          created_at: string | null
          data: string
          descricao: string | null
          id: string
          litros: number | null
          obs: string | null
          odometro: number | null
          plataforma: string | null
          tipo: string
          user_id: string | null
          valor: number
        }
        Insert: {
          categoria: string
          combustivel?: string | null
          created_at?: string | null
          data: string
          descricao?: string | null
          id?: string
          litros?: number | null
          obs?: string | null
          odometro?: number | null
          plataforma?: string | null
          tipo: string
          user_id?: string | null
          valor: number
        }
        Update: {
          categoria?: string
          combustivel?: string | null
          created_at?: string | null
          data?: string
          descricao?: string | null
          id?: string
          litros?: number | null
          obs?: string | null
          odometro?: number | null
          plataforma?: string | null
          tipo?: string
          user_id?: string | null
          valor?: number
        }
        Relationships: []
      }
      pagamentos: {
        Row: {
          created_at: string | null
          data: string
          emprestimo_id: string
          id: string
          obs: string | null
          user_id: string | null
          valor: number
        }
        Insert: {
          created_at?: string | null
          data: string
          emprestimo_id: string
          id?: string
          obs?: string | null
          user_id?: string | null
          valor: number
        }
        Update: {
          created_at?: string | null
          data?: string
          emprestimo_id?: string
          id?: string
          obs?: string | null
          user_id?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_emprestimo_id_fkey"
            columns: ["emprestimo_id"]
            isOneToOne: false
            referencedRelation: "emprestimos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
