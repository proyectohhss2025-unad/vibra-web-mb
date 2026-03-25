import 'tailwind-rn';

declare module 'tailwind-rn' {
    interface TailwindProviderProps {
        utilities: Record<string, { style: Record<string, unknown> }>;
        children: React.ReactNode;
    }

    interface Props {
        utilities: Record<string, { style: Record<string, unknown> }>;
        children: React.ReactNode;
    }

    interface TailwindProvider {
        utilities: Record<string, { style: Record<string, unknown> }>;
        children: React.ReactNode;
    }
}