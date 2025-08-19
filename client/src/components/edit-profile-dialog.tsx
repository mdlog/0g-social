import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ObjectUploader } from "@/components/ObjectUploader";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { updateUserProfileSchema, type UpdateUserProfile, type User } from "@shared/schema";
import { Edit2, Upload } from "lucide-react";

interface EditProfileDialogProps {
  user: User;
  trigger?: React.ReactNode;
}

export function EditProfileDialog({ user, trigger }: EditProfileDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<UpdateUserProfile>({
    resolver: zodResolver(updateUserProfileSchema),
    defaultValues: {
      username: user.username,
      displayName: user.displayName,
      bio: user.bio || "",
      avatar: user.avatar || "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateUserProfile) => {
      return apiRequest("/api/users/me", {
        method: "PUT",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts/feed"] });
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      setOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
      console.error("Profile update error:", error);
    },
  });

  const avatarUploadMutation = useMutation({
    mutationFn: async (avatarURL: string) => {
      return apiRequest("/api/users/me/avatar", {
        method: "PUT",
        body: JSON.stringify({ avatarURL }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    onSuccess: (result) => {
      form.setValue("avatar", result.avatar);
      queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: "Failed to update avatar. Please try again.",
        variant: "destructive",
      });
      console.error("Avatar upload error:", error);
    },
  });

  const onSubmit = (data: UpdateUserProfile) => {
    updateProfileMutation.mutate(data);
  };

  const handleAvatarUpload = async () => {
    try {
      const response = await apiRequest("/api/objects/upload", {
        method: "POST",
      });
      return {
        method: "PUT" as const,
        url: response.uploadURL,
      };
    } catch (error) {
      console.error("Failed to get upload URL:", error);
      throw error;
    }
  };

  const handleAvatarComplete = (result: { uploadURL: string; file: File }) => {
    avatarUploadMutation.mutate(result.uploadURL);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={form.watch("avatar") || user.avatar || ""} />
              <AvatarFallback>
                {user.displayName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <ObjectUploader
              maxNumberOfFiles={1}
              maxFileSize={5 * 1024 * 1024} // 5MB
              acceptedFileTypes={["image/*"]}
              onGetUploadParameters={handleAvatarUpload}
              onComplete={handleAvatarComplete}
              buttonClassName="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {avatarUploadMutation.isPending ? "Uploading..." : "Change Photo"}
            </ObjectUploader>
          </div>

          {/* Profile Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter display name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tell us about yourself..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex space-x-2 pt-4">
                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="flex-1"
                >
                  {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}