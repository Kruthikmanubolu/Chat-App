/*eslint-disable */

'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useMutationState } from '@/hooks/useMutationState';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from 'convex/react';
import { ConvexError } from 'convex/values';
import { CirclePlus, X } from 'lucide-react';
import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

type Props = object;

const createGroupFormSchema = z.object({
    name: z.string().min(1, { message: "This field can't be empty" }),
    members: z.string().array().min(1, { message: 'You must select at least 1 friend' }),
});

type Friend = {
    _id: Id<'users'>;
    username: string;
    imageUrl?: string;
    email?: string;
};

const CreateGroupDialog = (props: Props) => {
    const friends = useQuery(api.friends.get) as Friend[] | undefined;
    const { mutate: createGroup, pending } = useMutationState(api.conversation.createGroup);

    const form = useForm<z.infer<typeof createGroupFormSchema>>({
        resolver: zodResolver(createGroupFormSchema),
        defaultValues: { name: '', members: [] },
    });

    const members = form.watch('members', []);

    const unSelectedFriends = useMemo(() => {
        if (!friends) return [];
        return friends.filter((friend) => !members.includes(friend._id));
    }, [friends, members]);

    const handleSubmit = async (values: z.infer<typeof createGroupFormSchema>) => {
        await createGroup({ name: values.name, members: values.members })
            .then(() => {
                form.reset();
                toast.success('Group Created');
            })
            .catch((error) => {
                toast.error(
                    error instanceof ConvexError ? error.data : 'Unexpected Error Occurred'
                );
            });
    };

    return (
        <Dialog>
            <Tooltip>
                <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                        <Button size="icon" variant="outline">
                            <CirclePlus />
                        </Button>
                    </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Create Group</p>
                </TooltipContent>
            </Tooltip>

            <DialogContent className="block">
                <DialogHeader>
                    <DialogTitle>Create Group</DialogTitle>
                    <DialogDescription>Add your friends to get started</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
                        {/* Group Name Field */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Group name..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Members Selection */}
                        <FormField
                            control={form.control}
                            name="members"
                            render={() => (
                                <FormItem>
                                    <FormLabel>Members</FormLabel>
                                    <FormControl>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild disabled={unSelectedFriends.length === 0}>
                                                <Button className="w-full" variant="outline">
                                                    Select
                                                </Button>
                                            </DropdownMenuTrigger>

                                            <DropdownMenuContent className="w-full">
                                                {unSelectedFriends.map((friend) => (
                                                    <DropdownMenuCheckboxItem
                                                        key={friend._id}
                                                        className="flex items-center gap-2 w-full p-2"
                                                        checked={members.includes(friend._id)}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                form.setValue('members', [...members, friend._id]);
                                                            } else {
                                                                form.setValue(
                                                                    'members',
                                                                    members.filter((id) => id !== friend._id)
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        <Avatar className="w-8 h-8">
                                                            <AvatarImage src={friend.imageUrl} />
                                                            <AvatarFallback>
                                                                {friend.username.substring(0, 1)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <h4 className="truncate">{friend.username}</h4>
                                                    </DropdownMenuCheckboxItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {members.length > 0 && (
                            <Card className="flex flex-row items-start gap-3 overflow-x-auto px-2 h-24 no-scrollbar">
                                {friends
                                    ?.filter((friend) => members.includes(friend._id))
                                    .map((friend) => (
                                        <div key={friend._id} className="flex flex-col items-center gap-1">
                                            <div className="relative">
                                                <Avatar className='!items-center'>
                                                    <AvatarImage src={friend.imageUrl} />
                                                    <AvatarFallback>{friend.username.substring(0, 1)}</AvatarFallback>
                                                </Avatar>
                                                <X
                                                    className="text-muted-foreground w-4 h-4 absolute bottom-8 left-7 bg-muted rounded-full cursor-pointer"
                                                    onClick={() =>
                                                        form.setValue(
                                                            'members',
                                                            members.filter((id) => id !== friend._id)
                                                        )
                                                    }
                                                />
                                            </div>
                                            <p className="text-sm truncate">
                                                {friend.username.split(' ')[0]}
                                            </p>
                                        </div>
                                    ))}
                            </Card>
                        )}

                        <DialogFooter>
                            <Button type="submit" disabled={pending}>
                                {pending ? 'Creating...' : 'Create'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateGroupDialog;
