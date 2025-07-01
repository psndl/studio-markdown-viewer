import * as fs from 'fs/promises';
import * as path from 'path';
import { Suspense } from 'react';
import { SidebarProvider, SidebarInset, Sidebar, SidebarHeader, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarSeparator } from '@/components/ui/sidebar';
import { FileBrowser } from '@/components/FileBrowser';
import { MarkdownViewer } from '@/components/MarkdownViewer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

async function getMarkdownContent(fileName: string | null): Promise<string> {
  if (!fileName) {
    return '';
  }
  // Basic sanitization
  if (!/^[a-zA-Z0-9_-]+\.md$/.test(fileName)) {
    console.error('Invalid file name format:', fileName);
    return `# Error\n\nInvalid file name specified.`;
  }
  
  try {
    const docsDir = path.join(process.cwd(), 'docs');
    const filePath = path.join(docsDir, fileName);

    // Security check to prevent path traversal
    if (path.dirname(path.resolve(filePath)) !== path.resolve(docsDir)) {
      throw new Error('Attempted path traversal');
    }

    const content = await fs.readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    console.error('Error reading markdown file:', error);
    return `# Error\n\nCould not load file: ${fileName}`;
  }
}

function WelcomeMessage() {
  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle>Welcome to Markdown Voyager</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Select a file from the sidebar to view its content.</p>
        <p className="mt-4 text-muted-foreground">Or use the AI-powered search to find what you're looking for!</p>
      </CardContent>
    </Card>
  );
}

function ViewerSkeleton() {
    return (
        <Card className="flex-1 overflow-auto">
            <CardContent className="p-6">
                <Skeleton className="h-8 w-1/2 mb-6" />
                <Skeleton className="h-4 w-full mb-3" />
                <Skeleton className="h-4 w-full mb-3" />
                <Skeleton className="h-4 w-3/4 mb-6" />
                <Skeleton className="h-4 w-full mb-3" />
                <Skeleton className="h-4 w-5/6" />
            </CardContent>
        </Card>
    );
}

function BrowserSkeleton() {
    return (
        <Sidebar>
            <SidebarHeader>
                <Skeleton className="h-8 w-24" />
            </SidebarHeader>
            <SidebarContent>
                 <SidebarGroup>
                    <SidebarGroupLabel><Skeleton className="h-4 w-16" /></SidebarGroupLabel>
                    <div className="p-2">
                        <Skeleton className="h-9 w-full" />
                    </div>
                </SidebarGroup>
                <SidebarSeparator />
                <SidebarGroup>
                    <SidebarGroupLabel><Skeleton className="h-4 w-12" /></SidebarGroupLabel>
                    <div className="p-2 space-y-2">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                    </div>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}

async function MarkdownContent({ fileName }: { fileName: string | null }) {
    if (!fileName) return <WelcomeMessage />;
    const markdownContent = await getMarkdownContent(fileName);
    return <MarkdownViewer content={markdownContent} />;
}

export default async function Home({ searchParams }: { searchParams?: { file?: string } }) {
  const docsDir = path.join(process.cwd(), 'docs');
  const files = (await fs.readdir(docsDir)).filter(file => file.endsWith('.md'));
  
  return (
    <SidebarProvider>
      <Suspense fallback={<BrowserSkeleton />}>
        <FileBrowser files={files} />
      </Suspense>
      <SidebarInset className="p-4 flex">
        <Suspense fallback={<ViewerSkeleton />}>
            <MarkdownContent fileName={searchParams?.file ?? null} />
        </Suspense>
      </SidebarInset>
    </SidebarProvider>
  );
}
