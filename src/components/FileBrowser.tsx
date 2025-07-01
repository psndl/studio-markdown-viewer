'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarInput,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { FileText, Search, Loader2 } from 'lucide-react';
import { useFormState, useFormStatus } from 'react-dom';
import { search } from '@/app/actions';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

type FileBrowserProps = {
  files: string[];
};

function SearchButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" variant="ghost" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-9 p-0" disabled={pending}>
      {pending ? <Loader2 className="animate-spin h-4 w-4" /> : <Search className="h-4 w-4" />}
      <span className="sr-only">Search</span>
    </Button>
  );
}

export function FileBrowser({ files }: FileBrowserProps) {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const activeFile = searchParams.get('file');

  const initialState = { error: undefined, success: undefined };
  const [state, dispatch] = useFormState(search, initialState);

  useEffect(() => {
    if (state?.error) {
      toast({
        variant: 'destructive',
        title: 'Search Error',
        description: state.error,
      });
    }
  }, [state, toast]);

  return (
    <Sidebar>
      <SidebarHeader>
        <h2 className="text-xl font-semibold px-2">Markdown Voyager</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>AI Search</SidebarGroupLabel>
          <form action={dispatch} className="relative px-2">
            <SidebarInput name="query" placeholder="How to install?" />
            <SearchButton />
          </form>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>Files</SidebarGroupLabel>
          <SidebarMenu>
            {files.map(file => (
              <SidebarMenuItem key={file}>
                <SidebarMenuButton asChild isActive={activeFile === file}>
                  <Link href={`/?file=${file}`} className="w-full">
                    <FileText />
                    <span>{file.replace('.md', '')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
