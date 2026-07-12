-- =============================================================================
-- ArquiPro Digital — Storage RLS: bucket "resources"
-- Ejecuta en: Supabase Dashboard → SQL Editor → New query → Run
-- =============================================================================
--
-- Prerequisito: crear el bucket "resources" como PRIVADO en:
--   Supabase Dashboard → Storage → New Bucket → name: resources, Public: OFF
--
-- Solo usuarios autenticados con una orden APPROVED del producto correspondiente
-- pueden generar signed URLs para descargar archivos del bucket.
-- El Mega Pack (p-mega) da acceso a todos los archivos.
-- =============================================================================

create policy "Descargas solo con orden aprobada del producto"
  on storage.objects for select
  using (
    bucket_id = 'resources'
    and auth.role() = 'authenticated'
    and exists (
      select 1
      from public.orders
      where
        orders.user_id = auth.uid()
        and orders.status = 'approved'
        and (
          -- Mega Pack desbloquea todos los archivos
          orders.product_id = 'p-mega'
          -- O la orden corresponde exactamente al archivo solicitado
          or (orders.product_id = 'p-1'  and name = 'arquipro_master_blocks_2d.zip')
          or (orders.product_id = 'p-2'  and name = 'arquipro_revit_families.zip')
          or (orders.product_id = 'p-3'  and name = 'arquipro_control_obra.xlsx')
          or (orders.product_id = 'p-4'  and name = 'arquipro_concrete_pbr_textures.zip')
          or (orders.product_id = 'p-5'  and name = 'arquipro_diseno_zapatas.xlsx')
          or (orders.product_id = 'p-6'  and name = 'arquipro_planos_municipales.zip')
          or (orders.product_id = 'p-7'  and name = 'arquipro_proyecto_residencial.zip')
          or (orders.product_id = 'p-8'  and name = 'arquipro_numeros_acero.xlsx')
          or (orders.product_id = 'p-9'  and name = 'arquipro_detalles_cimentaciones.zip')
          or (orders.product_id = 'p-10' and name = 'arquipro_familias_mep.zip')
          or (orders.product_id = 'p-11' and name = 'arquipro_vegetacion_3d.zip')
          or (orders.product_id = 'p-12' and name = 'arquipro_maderas_pbr.zip')
        )
    )
  );
