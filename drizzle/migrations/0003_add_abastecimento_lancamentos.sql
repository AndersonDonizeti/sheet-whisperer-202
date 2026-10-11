ALTER TABLE public.lancamentos ADD COLUMN combustivel TEXT;
ALTER TABLE public.lancamentos ADD COLUMN litros NUMERIC;
ALTER TABLE public.lancamentos ADD COLUMN odometro NUMERIC;
COMMENT ON COLUMN public.lancamentos.combustivel IS 'Tipo de combustível (Etanol, Gasolina, GNV...) em lançamentos de Combustível';
COMMENT ON COLUMN public.lancamentos.litros IS 'Litros abastecidos';
COMMENT ON COLUMN public.lancamentos.odometro IS 'Odômetro (km) no momento do abastecimento';