'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Mail, MapPin, MessageCircle, Instagram, Facebook } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormInput } from '@/components/ui/FormInput';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { supabase } from '@/lib/supabase';
import { useThemeSettings } from '@/hooks/useThemeSettings';
import { text, useRows, useSection } from '@/components/publicCms';

type Form = {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
};

export function Contact() {
  const { register, handleSubmit, reset } = useForm<Form>();
  const [ok, setOk] = useState(false);
  const [error, setError] = useState('');
  const { settings } = useThemeSettings();
  const f=useSection('home_contact');
  const social=useRows('social_links',[] as any[],q=>q.eq('is_active',true).order('order_index'));
  const channel=(platform:string)=>social.find((item:any)=>String(item.platform).toLowerCase()===platform);

  async function onSubmit(data: Form) {
    setError('');
    if (supabase) {
      const result = await supabase.from('contact_messages').insert(data);
      if (result.error) { setError('Não foi possível registar a mensagem. Tente novamente ou use os contactos rápidos.'); return; }
    }

    setOk(true);
    reset();
  }

  return (
    <section id="contacto" className="py-24">
      <div className="mx-auto max-w-7xl px-4">
        <SectionTitle eyebrow={text(f.eyebrow,'Contacto')} title={text(f.section_title,'Fale com a Associação')} />
        <div className="grid gap-8 md:grid-cols-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-3xl border border-white/10 bg-zinc-900/60 p-6">
            <FormInput label="Nome" registration={register('name', { required: true })} />
            <FormInput label="Email" type="email" registration={register('email', { required: true })} />
            <FormInput label="Telefone" registration={register('phone')} />
            <FormInput label="Assunto" registration={register('subject', { required: true })} />
            <FormInput label="Mensagem" textarea registration={register('message', { required: true })} />
            {error && <p className="text-red-300">{error}</p>}
            {ok && (
              <p className="text-sun">
                Mensagem registada com sucesso. Se não receber resposta breve, contacte-nos também por WhatsApp ou email.
              </p>
            )}
            <Button type="submit">Enviar mensagem</Button>
          </form>
          <div className="rounded-3xl border border-white/10 bg-black/40 p-6">
            <h3 className="text-2xl font-bold text-white">Canais rápidos</h3>
            <div className="mt-6 grid gap-4 text-zinc-300">
              <a className="flex gap-3" href={text(channel('whatsapp')?.url, text(settings.whatsapp_url, text(settings.whatsapp, '#')))}><MessageCircle className="text-sun" /> WhatsApp</a>
              <a className="flex gap-3" href={channel('email')?.url || `mailto:${text(settings.contact_email,'')}`}><Mail className="text-sun" /> {text(channel('email')?.label,text(settings.contact_email,'Email a configurar'))}</a>
              <span className="flex gap-3"><Instagram className="text-sun" /> {text(channel('instagram')?.label,'Instagram a configurar')}</span>
              <span className="flex gap-3"><Facebook className="text-sun" /> {text(channel('facebook')?.label,'Facebook a configurar')}</span>
              <span className="flex gap-3"><MapPin className="text-sun" /> {text(channel('localizacao')?.label,text(settings.contact_location,'Localização a configurar'))}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
