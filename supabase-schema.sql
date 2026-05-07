-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  email text not null,
  role text not null check (role in ('admin', 'guru', 'siswa')) default 'siswa',
  avatar_url text,
  kelas_id uuid,
  created_at timestamptz default now()
);

-- Kelas table
create table public.kelas (
  id uuid default uuid_generate_v4() primary key,
  nama text not null,
  tingkat text not null,
  tahun_ajaran text not null,
  guru_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now()
);

-- Tugas table
create table public.tugas (
  id uuid default uuid_generate_v4() primary key,
  judul text not null,
  deskripsi text not null,
  mata_pelajaran text not null,
  kelas_id uuid references public.kelas(id) on delete cascade not null,
  guru_id uuid references public.profiles(id) on delete cascade not null,
  deadline timestamptz not null,
  max_nilai integer default 100,
  file_url text,
  created_at timestamptz default now()
);

-- Pengumpulan table
create table public.pengumpulan (
  id uuid default uuid_generate_v4() primary key,
  tugas_id uuid references public.tugas(id) on delete cascade not null,
  siswa_id uuid references public.profiles(id) on delete cascade not null,
  file_url text not null,
  catatan text,
  nilai integer,
  feedback text,
  status text not null check (status in ('belum_dinilai', 'sudah_dinilai')) default 'belum_dinilai',
  submitted_at timestamptz default now(),
  unique(tugas_id, siswa_id)
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'User'),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'siswa')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS Policies
alter table public.profiles enable row level security;
alter table public.kelas enable row level security;
alter table public.tugas enable row level security;
alter table public.pengumpulan enable row level security;

-- Profiles: users can read all, update own
create policy "profiles_select" on public.profiles for select using (true);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

-- Kelas: all authenticated can read, guru/admin can insert
create policy "kelas_select" on public.kelas for select using (auth.role() = 'authenticated');
create policy "kelas_insert" on public.kelas for insert with check (auth.uid() = guru_id);
create policy "kelas_update" on public.kelas for update using (auth.uid() = guru_id);
create policy "kelas_delete" on public.kelas for delete using (auth.uid() = guru_id);

-- Tugas: all authenticated can read, guru can insert/update/delete own
create policy "tugas_select" on public.tugas for select using (auth.role() = 'authenticated');
create policy "tugas_insert" on public.tugas for insert with check (auth.uid() = guru_id);
create policy "tugas_update" on public.tugas for update using (auth.uid() = guru_id);
create policy "tugas_delete" on public.tugas for delete using (auth.uid() = guru_id);

-- Pengumpulan: siswa can insert own, guru can read/update for their tugas
create policy "pengumpulan_select" on public.pengumpulan for select using (
  auth.uid() = siswa_id or
  exists (select 1 from public.tugas t where t.id = tugas_id and t.guru_id = auth.uid())
);
create policy "pengumpulan_insert" on public.pengumpulan for insert with check (auth.uid() = siswa_id);
create policy "pengumpulan_update" on public.pengumpulan for update using (
  exists (select 1 from public.tugas t where t.id = tugas_id and t.guru_id = auth.uid())
);

-- Storage bucket for submissions
insert into storage.buckets (id, name, public) values ('submissions', 'submissions', true);
create policy "submissions_select" on storage.objects for select using (bucket_id = 'submissions');
create policy "submissions_insert" on storage.objects for insert with check (bucket_id = 'submissions' and auth.role() = 'authenticated');
