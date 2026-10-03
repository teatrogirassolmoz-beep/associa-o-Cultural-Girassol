'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { FormInput } from '@/components/ui/FormInput';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { supabase } from '@/lib/supabase';
import { useSection, text } from '@/components/publicCms';

type FormType = 'company' | 'volunteer' | 'press' | 'info';

type App = {
  type: FormType;
  company_name?: string;
  country?: string;
  city?: string;
  contact_person: string;
  email: string;
  phone?: string;
  show_title?: string;
  duration?: string;
  team_size?: string;
  video_link?: string;
  portfolio_link?: string;
  synopsis?: string;
  technical_needs?: string;
  notes?: string;
};

const submitLabels: Record<FormType, string> = {
  company: 'Enviar inscrição',
  volunteer: 'Enviar candidatura',
  press: 'Solicitar credenciamento',
  info: 'Enviar pedido',
};

export function FitiForms() {
  const fields = useSection('fiti_forms');
  const { register, handleSubmit, reset, watch } = useForm<App>({ defaultValues: { type: 'company' }, shouldUnregister: true });
  const type = watch('type');
  const typeRegistration = register('type');
  const [ok, setOk] = useState(false);
  const [error, setError] = useState('');

  async function submit(data: App) {
    setError('');
    setOk(false);
    if (supabase) {
      const result = await supabase.from('fiti_applications').insert(data);
      if (result.error) {
        setError('Não foi possível registar o pedido. Tente novamente ou contacte a organização.');
        return;
      }
    }

    setOk(true);
    reset({ type: data.type });
  }

  return <section id="formularios" className="py-16 md:py-20">
    <div className="mx-auto max-w-4xl px-4">
      <SectionTitle eyebrow={text(fields.eyebrow, 'Formulários FITI')} title={text(fields.section_title, 'Inscrições e pedidos')} />
      <form onSubmit={handleSubmit(submit)} className="grid gap-4 rounded-3xl border border-white/10 bg-zinc-900/70 p-6 md:grid-cols-2">
        <label className="block text-sm text-zinc-200 md:col-span-2">Tipo de pedido
          <select className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white" {...typeRegistration} onChange={(event) => { void typeRegistration.onChange(event); setOk(false); setError(''); }}>
            <option value="company">{text(fields.company_option, 'Inscrição de companhia')}</option>
            <option value="volunteer">{text(fields.volunteer_option, 'Voluntariado')}</option>
            <option value="press">{text(fields.press_option, 'Credenciamento de imprensa')}</option>
            <option value="info">{text(fields.info_option, 'Pedido de informações')}</option>
          </select>
        </label>

        {type === 'company' && <>
          <FormInput label="Nome da companhia" registration={register('company_name', { required: true })} />
          <FormInput label="País" registration={register('country', { required: true })} />
          <FormInput label="Cidade" registration={register('city')} />
        </>}

        {type === 'press' && <>
          <FormInput label="Órgão de comunicação ou entidade" registration={register('company_name', { required: true })} />
          <FormInput label="País" registration={register('country')} />
          <FormInput label="Cidade" registration={register('city')} />
        </>}

        {type === 'volunteer' && <FormInput label="Cidade" registration={register('city')} />}

        <FormInput label="Pessoa de contacto" registration={register('contact_person', { required: true })} />
        <FormInput label="Email" type="email" registration={register('email', { required: true })} />
        <FormInput label="Telefone/WhatsApp" registration={register('phone')} />

        {type === 'company' && <>
          <FormInput label="Nome do espectáculo" registration={register('show_title', { required: true })} />
          <FormInput label="Duração" registration={register('duration')} />
          <FormInput label="Número de integrantes" registration={register('team_size')} />
          <FormInput label="Link de vídeo" registration={register('video_link')} />
          <FormInput label="Link de portfólio" registration={register('portfolio_link')} />
          <div className="md:col-span-2"><FormInput label="Sinopse" textarea registration={register('synopsis', { required: true })} /></div>
          <div className="md:col-span-2"><FormInput label="Necessidades técnicas" textarea registration={register('technical_needs')} /></div>
          <div className="md:col-span-2"><FormInput label="Observações" textarea registration={register('notes')} /></div>
        </>}

        {type === 'volunteer' && <div className="md:col-span-2"><FormInput label="Motivação, disponibilidade e área de interesse" textarea registration={register('notes', { required: true })} /></div>}
        {type === 'press' && <div className="md:col-span-2"><FormInput label="Cobertura pretendida e observações" textarea registration={register('notes', { required: true })} /></div>}
        {type === 'info' && <div className="md:col-span-2"><FormInput label="Informação solicitada" textarea registration={register('notes', { required: true })} /></div>}

        {error && <p className="text-red-300 md:col-span-2">{error}</p>}
        {ok && <p className="text-sun md:col-span-2">Pedido registado com sucesso. Se necessário, confirme também por WhatsApp ou email.</p>}
        <Button type="submit" className="md:col-span-2">{submitLabels[type]}</Button>
      </form>
    </div>
  </section>;
}
