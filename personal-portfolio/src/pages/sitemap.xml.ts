import { getCollection } from 'astro:content';
import { path } from '../lib/site';
import type { APIRoute } from 'astro';
export const GET: APIRoute = async ({ site }) => {
  const projects=await getCollection('projects',({data})=>data.detail);
  const routes=['','about/','cv/',...projects.map(p=>`work/${p.id}/`)];
  const xml=`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map(route=>`<url><loc>${new URL(path(route),site).href}</loc></url>`).join('')}</urlset>`;
  return new Response(xml,{headers:{'Content-Type':'application/xml; charset=utf-8'}});
};
