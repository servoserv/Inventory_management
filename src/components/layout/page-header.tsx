import type { FC } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
}

const PageHeader: FC<PageHeaderProps> = ({ title, description }) => {
  return (
    <div className="p-4 rounded-lg bg-card border shadow-sm">
      <h1 className="text-3xl font-bold font-headline tracking-tight">{title}</h1>
      {description && <p className="text-muted-foreground mt-1">{description}</p>}
    </div>
  );
};

export default PageHeader;
