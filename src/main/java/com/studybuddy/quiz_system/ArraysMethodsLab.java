package com.studybuddy.quiz_system;

public class ArraysMethodsLab {

    public static void main(String[] args) {
        System.out.println("Week 3 Arrays and Methods Lab");

        //
        // Arrays:
        //

        // 1. Create an array with the following values 1, 5, 2, 8, 13, 6
        int[] myArray = {1, 5, 2, 8, 13, 6};

        // 2. Print out the first element in the array
        System.out.println("First element: " + myArray[0]);

        // 3. Print out the last element in the array without using the number 5
        System.out.println("Last element: " + myArray[myArray.length - 1]);

        // 4. Print out the element in the array at position 6, what happens?
        // This will cause an ArrayIndexOutOfBoundsException since array has 0-5
        // System.out.println("Element at position 6: " + myArray[6]);
        System.out.println("Position 6 would cause ArrayIndexOutOfBoundsException");

        // 5. Print out the element in the array at position -1, what happens?
        // This will also cause an ArrayIndexOutOfBoundsException
        // System.out.println("Element at position -1: " + myArray[-1]);
        System.out.println("Position -1 would cause ArrayIndexOutOfBoundsException");

        // 6. Write a traditional for loop that prints out each element in the array
        System.out.println("\nTraditional for loop:");
        for (int i = 0; i < myArray.length; i++) {
            System.out.println(myArray[i]);
        }

        // 7. Write an enhanced for loop that prints out each element in the array
        System.out.println("\nEnhanced for loop:");
        for (int num : myArray) {
            System.out.println(num);
        }

        // 8. Create a new variable called sum, write a loop that adds 
        //     each element in the array to the sum
        int sum = 0;
        for (int num : myArray) {
            sum += num;
        }
        System.out.println("\nSum of array elements: " + sum);

        // 9. Create a new variable called average and assign the average value of the array to it
        double average = (double) sum / myArray.length;
        System.out.println("Average of array elements: " + average);

        // 10. Write an enhanced for loop that prints out each number in the array 
        //     only if the number is odd
        System.out.println("\nOdd numbers in array:");
        for (int num : myArray) {
            if (num % 2 != 0) {
                System.out.println(num);
            }
        }

        // 11. Create an array that contains the values "Sam", "Sally", "Thomas", and "Robert"
        String[] names = {"Sam", "Sally", "Thomas", "Robert"};

        // 12. Calculate the sum of all the letters in the new array
        int letterSum = 0;
        for (String name : names) {
            letterSum += name.length();
        }
        System.out.println("\nSum of all letters in names array: " + letterSum);

        //
        // Methods:
        //

        // 13. Write and test a method that takes a String name and prints out a greeting. 
        //     This method returns nothing.
        System.out.println("\nMethod 13 test:");
        printGreeting("John");

        // 14. Write and test a method that takes a String name and  
        //     returns a greeting.  Do not print in the method.
        System.out.println("\nMethod 14 test:");
        String greeting = getGreeting("Jane");
        System.out.println(greeting);

        // Compare method 13 and method 14:  
        //     a. Analyze the difference between these two methods.
        //     b. What do you find? 
        //     c. How are they different?
        System.out.println("\nMethod 13 vs 14: Method 13 prints directly (void return), " +
                         "Method 14 returns a String for flexible use");

        // 15. Write and test a method that takes a String and an int and 
        //     returns true if the number of letters in the string is greater than the int
        System.out.println("\nMethod 15 test:");
        System.out.println("'Hello' has more than 3 letters: " + hasMoreLetters("Hello", 3));
        System.out.println("'Hi' has more than 3 letters: " + hasMoreLetters("Hi", 3));

        // 16. Write and test a method that takes an array of string and a string and 
        //     returns true if the string passed in exists in the array
        System.out.println("\nMethod 16 test:");
        System.out.println("'Sam' exists in names array: " + stringExists(names, "Sam"));
        System.out.println("'Mike' exists in names array: " + stringExists(names, "Mike"));

        // 17. Write and test a method that takes an array of int and 
        //     returns the smallest number in the array
        System.out.println("\nMethod 17 test:");
        System.out.println("Smallest number in array: " + findSmallest(myArray));

        // 18. Write and test a method that takes an array of double and 
        //     returns the average
        System.out.println("\nMethod 18 test:");
        double[] doubleArray = {1.5, 2.5, 3.5, 4.5};
        System.out.println("Average of double array: " + calculateAverage(doubleArray));

        // 19. Write and test a method that takes an array of Strings and 
        //     returns an array of int where each element
        //     matches the length of the string at that position
        System.out.println("\nMethod 19 test:");
        int[] lengths = getStringLengths(names);
        System.out.print("String lengths: ");
        for (int length : lengths) {
            System.out.print(length + " ");
        }
        System.out.println();

        // 20. Write and test a method that takes an array of strings and 
        //     returns true if the sum of letters for all strings with an even amount of letters
        //     is greater than the sum of those with an odd amount of letters.
        System.out.println("\nMethod 20 test:");
        System.out.println("Even letter sum > odd letter sum: " + evenGreaterThanOdd(names));

        // 21. Write and test a method that takes a string and 
        //     returns true if the string is a palindrome
        System.out.println("\nMethod 21 test:");
        System.out.println("'racecar' is palindrome: " + isPalindrome("racecar"));
        System.out.println("'hello' is palindrome: " + isPalindrome("hello"));
        System.out.println("'A man a plan a canal Panama' is palindrome: " + 
                         isPalindrome("A man a plan a canal Panama"));
    }

    // Method 13: Print greeting (void return)
    public static void printGreeting(String name) {
        System.out.println("Hello, " + name + "!");
    }

    // Method 14: Return greeting (String return)
    public static String getGreeting(String name) {
        return "Hello, " + name + "!";
    }

    // Method 15: Check if string has more letters than given number
    public static boolean hasMoreLetters(String str, int num) {
        return str.length() > num;
    }

    // Method 16: Check if string exists in array
    public static boolean stringExists(String[] array, String str) {
        for (String element : array) {
            if (element.equals(str)) {
                return true;
            }
        }
        return false;
    }

    // Method 17: Find smallest number in int array
    public static int findSmallest(int[] array) {
        int smallest = array[0];
        for (int num : array) {
            if (num < smallest) {
                smallest = num;
            }
        }
        return smallest;
    }

    // Method 18: Calculate average of double array
    public static double calculateAverage(double[] array) {
        double sum = 0;
        for (double num : array) {
            sum += num;
        }
        return sum / array.length;
    }

    // Method 19: Get array of string lengths
    public static int[] getStringLengths(String[] strings) {
        int[] lengths = new int[strings.length];
        for (int i = 0; i < strings.length; i++) {
            lengths[i] = strings[i].length();
        }
        return lengths;
    }

    // Method 20: Check if even letter sum > odd letter sum
    public static boolean evenGreaterThanOdd(String[] strings) {
        int evenSum = 0;
        int oddSum = 0;

        for (String str : strings) {
            int length = str.length();
            if (length % 2 == 0) {
                evenSum += length;
            } else {
                oddSum += length;
            }
        }

        return evenSum > oddSum;
    }

    // Method 21: Check if string is palindrome
    public static boolean isPalindrome(String str) {
        // Remove spaces and convert to lowercase for comparison
        str = str.replaceAll("\\s", "").toLowerCase();

        int left = 0;
        int right = str.length() - 1;

        while (left < right) {
            if (str.charAt(left) != str.charAt(right)) {
                return false;
            }
            left++;
            right--;
        }

        return true;
    }
}
